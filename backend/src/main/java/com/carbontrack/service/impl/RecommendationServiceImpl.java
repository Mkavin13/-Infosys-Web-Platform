package com.carbontrack.service.impl;

import com.carbontrack.dto.PersonalizedRecommendationDTO;
import com.carbontrack.dto.WeeklyInsightsDTO;
import com.carbontrack.entity.User;
import com.carbontrack.repository.ActivityLogRepository;
import com.carbontrack.service.RecommendationProvider;
import com.carbontrack.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {

    private final ActivityLogRepository activityLogRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "recommendations", key = "'rec_' + #user.id")
    public List<PersonalizedRecommendationDTO> getRecommendations(User user) {
        LocalDate startDate = LocalDate.now().minusDays(30);
        List<Object[]> rows = activityLogRepository.getActivityTypeEmissionsInPeriod(user.getId(), startDate);

        List<PersonalizedRecommendationDTO> list = new ArrayList<>();
        int count = 0;
        for (Object[] row : rows) {
            if (count >= 3) break;
            String type = (String) row[0];
            Double amt = (Double) row[1];
            if (type == null || amt == null) continue;

            list.add(PersonalizedRecommendationDTO.builder()
                    .activityType(type)
                    .co2Emitted(Math.round(amt * 100.0) / 100.0)
                    .tips(RecommendationProvider.getTips(type))
                    .build());
            count++;
        }

        if (list.isEmpty()) {
            list.add(PersonalizedRecommendationDTO.builder()
                    .activityType("GENERAL")
                    .co2Emitted(0.0)
                    .tips(RecommendationProvider.getTips("GENERAL"))
                    .build());
        }

        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public WeeklyInsightsDTO getWeeklyInsights(User user) {
        LocalDate now = LocalDate.now();
        LocalDate thisWeekStart = now.minusDays(7);
        LocalDate lastWeekStart = now.minusDays(14);
        LocalDate lastWeekEnd = now.minusDays(8);

        Double thisWeekCo2 = activityLogRepository.getCo2eByUserIdAndDateRange(user.getId(), thisWeekStart, now);
        Double lastWeekCo2 = activityLogRepository.getCo2eByUserIdAndDateRange(user.getId(), lastWeekStart, lastWeekEnd);

        if (thisWeekCo2 == null) thisWeekCo2 = 0.0;
        if (lastWeekCo2 == null) lastWeekCo2 = 0.0;

        double diffPercentage = 0.0;
        if (lastWeekCo2 > 0) {
            diffPercentage = ((thisWeekCo2 - lastWeekCo2) / lastWeekCo2) * 100.0;
        }

        String insightMessage;
        if (thisWeekCo2 == 0.0 && lastWeekCo2 == 0.0) {
            insightMessage = "No emissions logged in the past two weeks. Keep tracking!";
        } else if (diffPercentage < 0) {
            insightMessage = String.format("Amazing work! You've reduced your weekly footprint by %.1f%% compared to last week.", Math.abs(diffPercentage));
        } else if (diffPercentage > 0) {
            insightMessage = String.format("Your footprint went up by %.1f%% compared to last week. Review the recommendations below to improve.", diffPercentage);
        } else {
            insightMessage = "Your weekly footprint remains consistent. Try swapping a transport or meal activity to drop it further!";
        }

        List<PersonalizedRecommendationDTO> recommendations = getRecommendations(user);

        return WeeklyInsightsDTO.builder()
                .totalWeeklyCo2(Math.round(thisWeekCo2 * 100.0) / 100.0)
                .differencePercentage(Math.round(diffPercentage * 100.0) / 100.0)
                .insightMessage(insightMessage)
                .recommendations(recommendations)
                .build();
    }
}
