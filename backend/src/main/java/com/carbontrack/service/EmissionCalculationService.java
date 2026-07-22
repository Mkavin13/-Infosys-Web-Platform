package com.carbontrack.service;

import com.carbontrack.entity.ActivityCategory;
import com.carbontrack.entity.EmissionFactor;
import com.carbontrack.strategy.EmissionCalculationStrategy;
import com.carbontrack.strategy.EmissionStrategyFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmissionCalculationService {

    private final EmissionFactorCacheService emissionFactorCacheService;
    private final EmissionStrategyFactory strategyFactory;

    public double calculateCo2e(ActivityCategory category, String activityType, double quantity) {
        EmissionFactor factor = emissionFactorCacheService.getEmissionFactor(activityType);
        
        // Assert categories match to prevent rule inconsistencies
        if (factor.getCategory() != category) {
            throw new IllegalArgumentException("Activity type " + activityType + 
                    " belongs to category " + factor.getCategory() + ", not " + category);
        }

        EmissionCalculationStrategy strategy = strategyFactory.getStrategy(category);
        return strategy.calculate(quantity, factor);
    }
}
