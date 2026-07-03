package com.carbontrack.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalDto {
    private Long id;
    private String targetCategory; // e.g. "TRANSPORT" or "OVERALL"
    private Double targetReductionPercentage;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double targetValue; // Limit threshold (kg CO2e)
    private Double currentValue; // Logged emissions (kg CO2e)
    private Double progressPercentage; // Progress towards target limit
    private String status; // ACTIVE, COMPLETED, FAILED
}
