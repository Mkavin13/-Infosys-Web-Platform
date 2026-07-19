package com.carbontrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeerBenchmarkingDto {
    private Double userPercentile;
    private Integer userRank;
    private Integer totalUsers;
    private List<CategoryAverageDto> categoryComparisons;
}
