package com.carbontrack.strategy;

import com.carbontrack.entity.ActivityCategory;
import com.carbontrack.entity.EmissionFactor;
import org.springframework.stereotype.Component;

@Component
public class ShoppingCalculationStrategy implements EmissionCalculationStrategy {

    @Override
    public ActivityCategory getCategory() {
        return ActivityCategory.SHOPPING;
    }

    @Override
    public double calculate(double quantity, EmissionFactor factor) {
        // Base rule: CO2e = spend amount * factor
        return quantity * factor.getFactor();
    }
}
