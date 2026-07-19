package com.carbontrack.service;

import com.carbontrack.dto.PersonalizedRecommendationDTO;
import com.carbontrack.dto.WeeklyInsightsDTO;
import com.carbontrack.entity.User;

import java.util.List;

public interface RecommendationService {
    List<PersonalizedRecommendationDTO> getRecommendations(User user);
    WeeklyInsightsDTO getWeeklyInsights(User user);
}
