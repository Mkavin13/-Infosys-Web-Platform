package com.carbontrack.config;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.interceptor.CacheInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;

@Configuration
@EnableCaching
public class RedisConfig implements CachingConfigurer {

    private final RedisConnectionFactory connectionFactory;

    public RedisConfig(RedisConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    @Override
    @Bean
    public CacheManager cacheManager() {
        String host = System.getenv("SPRING_REDIS_HOST");
        if (host == null || host.trim().isEmpty()) {
            host = System.getProperty("spring.redis.host", "localhost");
        }
        String portStr = System.getenv("SPRING_REDIS_PORT");
        if (portStr == null || portStr.trim().isEmpty()) {
            portStr = System.getProperty("spring.redis.port", "6379");
        }
        int port = 6379;
        try {
            port = Integer.parseInt(portStr);
        } catch (NumberFormatException ignored) {}

        // Ping Redis port to check connectivity
        try (java.net.Socket socket = new java.net.Socket()) {
            socket.connect(new java.net.InetSocketAddress(host, port), 500); // 500ms timeout
            
            // Redis is available! Build RedisCacheManager
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());
            objectMapper.activateDefaultTyping(
                    LaissezFaireSubTypeValidator.instance,
                    ObjectMapper.DefaultTyping.NON_FINAL,
                    JsonTypeInfo.As.PROPERTY
            );
            GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(objectMapper);

            RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofHours(24)) // Default TTL 24 hours
                    .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer))
                    .disableCachingNullValues();

            Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
            cacheConfigurations.put("dailySummary", defaultConfig.entryTtl(Duration.ofHours(12)));
            cacheConfigurations.put("weeklySummary", defaultConfig.entryTtl(Duration.ofDays(7)));
            cacheConfigurations.put("monthlySummary", defaultConfig.entryTtl(Duration.ofDays(30)));
            cacheConfigurations.put("recommendations", defaultConfig.entryTtl(Duration.ofHours(6)));
            cacheConfigurations.put("leaderboard", defaultConfig.entryTtl(Duration.ofMinutes(30)));
            cacheConfigurations.put("emissionFactors", defaultConfig.entryTtl(Duration.ofDays(30)));

            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(defaultConfig)
                    .withInitialCacheConfigurations(cacheConfigurations)
                    .build();
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(RedisConfig.class)
                .warn("Redis is not available at {}:{}. Falling back to in-memory ConcurrentMapCacheManager.", host, port);
            
            return new org.springframework.cache.concurrent.ConcurrentMapCacheManager(
                "dailySummary", "weeklySummary", "monthlySummary", "recommendations", "leaderboard", "emissionFactors"
            );
        }
    }

    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            private final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(RedisConfig.class);

            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Redis cache GET failed for key {}: {}. Falling back to database.", key, exception.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.warn("Redis cache PUT failed for key {}: {}.", key, exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Redis cache EVICT failed for key {}: {}.", key, exception.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.warn("Redis cache CLEAR failed: {}.", exception.getMessage());
            }
        };
    }

    @Bean
    public BeanPostProcessor cacheInterceptorPostProcessor() {
        return new BeanPostProcessor() {
            @Override
            public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
                if (bean instanceof CacheInterceptor) {
                    ((CacheInterceptor) bean).setErrorHandler(errorHandler());
                }
                return bean;
            }
        };
    }
}
