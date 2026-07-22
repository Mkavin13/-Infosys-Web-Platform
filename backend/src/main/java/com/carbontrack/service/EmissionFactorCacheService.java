package com.carbontrack.service;

import com.carbontrack.entity.EmissionFactor;
import com.carbontrack.exception.ResourceNotFoundException;
import com.carbontrack.repository.EmissionFactorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmissionFactorCacheService {

    private final EmissionFactorRepository emissionFactorRepository;

    @Cacheable(value = "emissionFactors", key = "#activityType")
    public EmissionFactor getEmissionFactor(String activityType) {
        return emissionFactorRepository.findByActivityType(activityType)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No emission factor configured for activity type: " + activityType));
    }
}
