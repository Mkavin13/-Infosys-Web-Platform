package com.carbontrack.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyTrendDto {
    private String date;
    private Double amount;
}
