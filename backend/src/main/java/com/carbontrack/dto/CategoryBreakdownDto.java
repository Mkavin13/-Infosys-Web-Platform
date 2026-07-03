package com.carbontrack.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryBreakdownDto {
    private String category;
    private Double amount;
    private Double percentage;
}
