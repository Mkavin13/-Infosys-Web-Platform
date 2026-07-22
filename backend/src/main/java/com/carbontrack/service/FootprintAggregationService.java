package com.carbontrack.service;

import com.carbontrack.dto.FootprintSummaryDTO;
import java.time.LocalDate;
import java.util.List;

public interface FootprintAggregationService {
    List<FootprintSummaryDTO> getDailySummary(Long userId, LocalDate startDate, LocalDate endDate);
    List<FootprintSummaryDTO> getWeeklySummary(Long userId, LocalDate startDate, LocalDate endDate);
    List<FootprintSummaryDTO> getMonthlySummary(Long userId, LocalDate startDate, LocalDate endDate);
}
