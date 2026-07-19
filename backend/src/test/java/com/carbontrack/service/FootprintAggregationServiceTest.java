package com.carbontrack.service;

import com.carbontrack.dto.FootprintSummaryDTO;
import com.carbontrack.entity.ActivityCategory;
import com.carbontrack.repository.FootprintAggregationRepository;
import com.carbontrack.service.impl.FootprintAggregationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FootprintAggregationServiceTest {

    @Mock
    private FootprintAggregationRepository footprintAggregationRepository;

    private FootprintAggregationService footprintAggregationService;

    @BeforeEach
    void setUp() {
        footprintAggregationService = new FootprintAggregationServiceImpl(footprintAggregationRepository);
    }

    @Test
    void testGetDailySummary() {
        Long userId = 1L;
        LocalDate start = LocalDate.of(2026, 7, 1);
        LocalDate end = LocalDate.of(2026, 7, 3);

        List<FootprintSummaryDTO> expected = Arrays.asList(
                new FootprintSummaryDTO(ActivityCategory.TRANSPORT, LocalDate.of(2026, 7, 1), 12.5, 2L),
                new FootprintSummaryDTO(ActivityCategory.FOOD, LocalDate.of(2026, 7, 2), 4.2, 1L)
        );

        when(footprintAggregationRepository.aggregateFootprint(userId, start, end)).thenReturn(expected);

        List<FootprintSummaryDTO> actual = footprintAggregationService.getDailySummary(userId, start, end);

        assertEquals(expected.size(), actual.size());
        assertEquals(expected.get(0).getCategory(), actual.get(0).getCategory());
        assertEquals(expected.get(0).getTotalCo2e(), actual.get(0).getTotalCo2e());
    }

    @Test
    void testGetWeeklySummary() {
        Long userId = 1L;
        LocalDate start = LocalDate.of(2026, 7, 1); // Wednesday
        LocalDate end = LocalDate.of(2026, 7, 10);

        List<FootprintSummaryDTO> daily = Arrays.asList(
                new FootprintSummaryDTO(ActivityCategory.TRANSPORT, LocalDate.of(2026, 7, 1), 10.0, 1L), // Week: Mon 2026-06-29
                new FootprintSummaryDTO(ActivityCategory.TRANSPORT, LocalDate.of(2026, 7, 3), 15.0, 1L), // Week: Mon 2026-06-29
                new FootprintSummaryDTO(ActivityCategory.TRANSPORT, LocalDate.of(2026, 7, 8), 20.0, 1L)  // Week: Mon 2026-07-06
        );

        when(footprintAggregationRepository.aggregateFootprint(userId, start, end)).thenReturn(daily);

        List<FootprintSummaryDTO> weekly = footprintAggregationService.getWeeklySummary(userId, start, end);

        // Should group weekly: 2 records (one for week of 2026-06-29 with total 25.0, one for week of 2026-07-06 with total 20.0)
        assertEquals(2, weekly.size());
        
        FootprintSummaryDTO week1 = weekly.stream()
                .filter(w -> w.getDate().equals(LocalDate.of(2026, 6, 29)))
                .findFirst().orElseThrow();
        assertEquals(25.0, week1.getTotalCo2e());
        assertEquals(2L, week1.getActivityCount());
    }
}
