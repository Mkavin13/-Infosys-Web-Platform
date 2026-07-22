package com.carbontrack.controller;

import com.carbontrack.dto.PersonalizedRecommendationDTO;
import com.carbontrack.dto.WeeklyInsightsDTO;
import com.carbontrack.entity.User;
import com.carbontrack.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<List<PersonalizedRecommendationDTO>> getRecommendations(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(recommendationService.getRecommendations(user));
    }

    @GetMapping("/weekly")
    public ResponseEntity<WeeklyInsightsDTO> getWeeklyInsights(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(recommendationService.getWeeklyInsights(user));
    }
}
