package com.carbontrack.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComparisonDto {
    private Double userValue;
    private Double comparisonValue;
    private Double percentageDifference; // userValue vs comparisonValue
}
