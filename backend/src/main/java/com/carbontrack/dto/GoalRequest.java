package com.carbontrack.dto;

import com.carbontrack.entity.ActivityCategory;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalRequest {

    private ActivityCategory targetCategory; // Nullable (null means overall emissions goal)

    @NotNull(message = "Reduction percentage is required")
    @Min(value = 1, message = "Reduction must be at least 1%")
    @Max(value = 100, message = "Reduction cannot exceed 100%")
    private Double targetReductionPercentage;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;
}
