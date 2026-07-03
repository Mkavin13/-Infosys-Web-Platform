package com.carbontrack.strategy;

import com.carbontrack.entity.ActivityCategory;
import com.carbontrack.entity.EmissionFactor;
import org.springframework.stereotype.Component;

@Component
public class FoodCalculationStrategy implements EmissionCalculationStrategy {

    @Override
    public ActivityCategory getCategory() {
        return ActivityCategory.FOOD;
    }

    @Override
    public double calculate(double quantity, EmissionFactor factor) {
        // Base rule: CO2e = servings * factor
        return quantity * factor.getFactor();
    }
}
