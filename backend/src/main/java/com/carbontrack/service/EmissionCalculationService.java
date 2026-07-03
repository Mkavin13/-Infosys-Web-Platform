package com.carbontrack.service;

import com.carbontrack.entity.ActivityCategory;
import com.carbontrack.entity.EmissionFactor;
import com.carbontrack.exception.ResourceNotFoundException;
import com.carbontrack.repository.EmissionFactorRepository;
import com.carbontrack.strategy.EmissionCalculationStrategy;
import com.carbontrack.strategy.EmissionStrategyFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmissionCalculationService {

    private final EmissionFactorRepository emissionFactorRepository;
    private final EmissionStrategyFactory strategyFactory;

    public double calculateCo2e(ActivityCategory category, String activityType, double quantity) {
        EmissionFactor factor = emissionFactorRepository.findByActivityType(activityType)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No emission factor configured for activity type: " + activityType));
        
        // Assert categories match to prevent rule inconsistencies
        if (factor.getCategory() != category) {
            throw new IllegalArgumentException("Activity type " + activityType + 
                    " belongs to category " + factor.getCategory() + ", not " + category);
        }

        EmissionCalculationStrategy strategy = strategyFactory.getStrategy(category);
        return strategy.calculate(quantity, factor);
    }
}
