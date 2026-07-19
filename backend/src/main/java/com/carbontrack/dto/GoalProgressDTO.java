package com.carbontrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalProgressDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long goalId;
    private Double currentValue;
    private Double targetValue;
    private Double progressPercentage;
    private Double remainingReduction;
    private String trackStatus; // ON_TRACK, BEHIND_SCHEDULE, AHEAD_OF_SCHEDULE
    private LocalDate expectedCompletionDate;
}
