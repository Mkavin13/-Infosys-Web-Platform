package com.carbontrack.strategy;

import com.carbontrack.entity.ActivityCategory;
import com.carbontrack.entity.EmissionFactor;
import org.springframework.stereotype.Component;

@Component
public class TransportCalculationStrategy implements EmissionCalculationStrategy {

    @Override
    public ActivityCategory getCategory() {
        return ActivityCategory.TRANSPORT;
    }

    @Override
    public double calculate(double quantity, EmissionFactor factor) {
        double distanceInKm = quantity;
        
        // Custom Rule Engine logic: Unit conversion handling
        if ("MILES".equalsIgnoreCase(factor.getUnit()) || "MILE".equalsIgnoreCase(factor.getUnit())) {
            // Convert to miles if factor is per mile
            distanceInKm = quantity * 0.621371;
        } else if (factor.getUnit().equalsIgnoreCase("KM")) {
            // Factor is per km, check if input was in miles
            // For simplicity, we assume input matches the factor's expected unit,
            // but we can support conversion if needed.
        }

        return quantity * factor.getFactor();
    }
}
