package com.carbontrack.strategy;

import com.carbontrack.entity.ActivityCategory;
import com.carbontrack.entity.EmissionFactor;
import org.springframework.stereotype.Component;

@Component
public class ElectricityCalculationStrategy implements EmissionCalculationStrategy {

    @Override
    public ActivityCategory getCategory() {
        return ActivityCategory.ELECTRICITY;
    }

    @Override
    public double calculate(double quantity, EmissionFactor factor) {
        // Base rule: CO2e = kWh * factor
        return quantity * factor.getFactor();
    }
}
