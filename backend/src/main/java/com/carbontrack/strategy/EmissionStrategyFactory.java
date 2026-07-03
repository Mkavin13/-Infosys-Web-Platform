package com.carbontrack.strategy;

import com.carbontrack.entity.ActivityCategory;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class EmissionStrategyFactory {

    private final List<EmissionCalculationStrategy> strategies;
    private final Map<ActivityCategory, EmissionCalculationStrategy> strategyMap = new HashMap<>();

    @PostConstruct
    public void init() {
        for (EmissionCalculationStrategy strategy : strategies) {
            strategyMap.put(strategy.getCategory(), strategy);
        }
    }

    public EmissionCalculationStrategy getStrategy(ActivityCategory category) {
        EmissionCalculationStrategy strategy = strategyMap.get(category);
        if (strategy == null) {
            throw new IllegalArgumentException("No calculation strategy registered for category: " + category);
        }
        return strategy;
    }
}
