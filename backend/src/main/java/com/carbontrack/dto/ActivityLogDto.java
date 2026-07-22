package com.carbontrack.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLogDto {
    private Long id;
    private String category;
    private String activityType;
    private Double quantity;
    private String unit;
    private LocalDate logDate;
    private Double calculatedCo2e;
}
