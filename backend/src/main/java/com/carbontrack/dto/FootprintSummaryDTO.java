package com.carbontrack.dto;

import com.carbontrack.entity.ActivityCategory;
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
public class FootprintSummaryDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private ActivityCategory category;
    private LocalDate date;
    private Double totalCo2e;
    private Long activityCount;
}
