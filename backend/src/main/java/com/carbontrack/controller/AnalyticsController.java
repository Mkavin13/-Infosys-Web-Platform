package com.carbontrack.controller;

import com.carbontrack.dto.AnalyticsSummaryDto;
import com.carbontrack.dto.RecommendationDto;
import com.carbontrack.dto.WeeklyTrendDto;
import com.carbontrack.entity.User;
import com.carbontrack.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryDto> getSummary(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(analyticsService.getSummary(user));
    }

    @GetMapping("/weekly-trend")
    public ResponseEntity<List<WeeklyTrendDto>> getWeeklyTrend(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(analyticsService.getWeeklyTrend(user));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<RecommendationDto>> getRecommendations(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(analyticsService.getRecommendations(user));
    }
}
