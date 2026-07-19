package com.carbontrack.strategy;

import com.carbontrack.entity.ActivityCategory;
import com.carbontrack.entity.EmissionFactor;

public interface EmissionCalculationStrategy {
    ActivityCategory getCategory();
    double calculate(double quantity, EmissionFactor factor);
}
