package com.carbontrack.service.impl;

import com.carbontrack.dto.FootprintSummaryDTO;
import com.carbontrack.repository.FootprintAggregationRepository;
import com.carbontrack.service.FootprintAggregationService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FootprintAggregationServiceImpl implements FootprintAggregationService {

    private final FootprintAggregationRepository footprintAggregationRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "dailySummary", key = "#userId + '_' + #startDate + '_' + #endDate")
    public List<FootprintSummaryDTO> getDailySummary(Long userId, LocalDate startDate, LocalDate endDate) {
        return footprintAggregationRepository.aggregateFootprint(userId, startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "weeklySummary", key = "#userId + '_' + #startDate + '_' + #endDate")
    public List<FootprintSummaryDTO> getWeeklySummary(Long userId, LocalDate startDate, LocalDate endDate) {
        List<FootprintSummaryDTO> daily = footprintAggregationRepository.aggregateFootprint(userId, startDate, endDate);
        
        Map<String, FootprintSummaryDTO> grouped = new LinkedHashMap<>();
        for (FootprintSummaryDTO dto : daily) {
            LocalDate startOfWeek = dto.getDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            String key = dto.getCategory() + "_" + startOfWeek;
            
            grouped.merge(key, 
                new FootprintSummaryDTO(dto.getCategory(), startOfWeek, dto.getTotalCo2e(), dto.getActivityCount()),
                (existing, next) -> {
                    existing.setTotalCo2e(existing.getTotalCo2e() + next.getTotalCo2e());
                    existing.setActivityCount(existing.getActivityCount() + next.getActivityCount());
                    return existing;
                }
            );
        }
        
        return new ArrayList<>(grouped.values());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "monthlySummary", key = "#userId + '_' + #startDate + '_' + #endDate")
    public List<FootprintSummaryDTO> getMonthlySummary(Long userId, LocalDate startDate, LocalDate endDate) {
        List<FootprintSummaryDTO> daily = footprintAggregationRepository.aggregateFootprint(userId, startDate, endDate);
        
        Map<String, FootprintSummaryDTO> grouped = new LinkedHashMap<>();
        for (FootprintSummaryDTO dto : daily) {
            LocalDate startOfMonth = dto.getDate().withDayOfMonth(1);
            String key = dto.getCategory() + "_" + startOfMonth;
            
            grouped.merge(key, 
                new FootprintSummaryDTO(dto.getCategory(), startOfMonth, dto.getTotalCo2e(), dto.getActivityCount()),
                (existing, next) -> {
                    existing.setTotalCo2e(existing.getTotalCo2e() + next.getTotalCo2e());
                    existing.setActivityCount(existing.getActivityCount() + next.getActivityCount());
                    return existing;
                }
            );
        }
        
        return new ArrayList<>(grouped.values());
    }
}
