package com.carbontrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BenchmarkDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Double userTotalCo2;
    private Double platformAverageCo2;
    private Map<String, Double> userCategoryTotals;
    private Map<String, Double> platformCategoryAverages;
}
