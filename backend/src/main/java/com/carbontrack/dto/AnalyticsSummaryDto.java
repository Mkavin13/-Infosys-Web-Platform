package com.carbontrack.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsSummaryDto {
    private Double totalCo2e;
    private List<CategoryBreakdownDto> categoryBreakdown;
    private ComparisonDto momComparison;
    private ComparisonDto peerComparison;
    private List<String> earnedBadges;
}
