package com.carbontrack.service.impl;

import com.carbontrack.dto.BenchmarkDTO;
import com.carbontrack.dto.LeaderboardDTO;
import com.carbontrack.entity.ActivityCategory;
import com.carbontrack.entity.User;
import com.carbontrack.repository.ActivityLogRepository;
import com.carbontrack.service.BenchmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BenchmarkServiceImpl implements BenchmarkService {

    private final ActivityLogRepository activityLogRepository;

    @Override
    @Transactional(readOnly = true)
    public BenchmarkDTO getBenchmark(User user) {
        Double userTotal = activityLogRepository.getTotalCo2eByUserId(user.getId());
        if (userTotal == null) userTotal = 0.0;

        Double platformAvg = activityLogRepository.getPlatformAverageCo2();
        if (platformAvg == null) platformAvg = 0.0;

        // User breakdown by category
        List<Object[]> userBreakdownRows = activityLogRepository.getCategoryBreakdownByUserId(user.getId());
        Map<String, Double> userCategoryTotals = new HashMap<>();
        for (ActivityCategory cat : ActivityCategory.values()) {
            userCategoryTotals.put(cat.name(), 0.0);
        }
        for (Object[] row : userBreakdownRows) {
            ActivityCategory cat = (ActivityCategory) row[0];
            Double val = (Double) row[1];
            if (cat != null && val != null) {
                userCategoryTotals.put(cat.name(), Math.round(val * 100.0) / 100.0);
            }
        }

        // Platform category averages
        List<Object[]> platformAvgRows = activityLogRepository.getPlatformCategoryAverages();
        Map<String, Double> platformCategoryAverages = new HashMap<>();
        for (ActivityCategory cat : ActivityCategory.values()) {
            platformCategoryAverages.put(cat.name(), 0.0);
        }
        for (Object[] row : platformAvgRows) {
            ActivityCategory cat = (ActivityCategory) row[0];
            Double val = (Double) row[1];
            if (cat != null && val != null) {
                platformCategoryAverages.put(cat.name(), Math.round(val * 100.0) / 100.0);
            }
        }

        return BenchmarkDTO.builder()
                .userTotalCo2(Math.round(userTotal * 100.0) / 100.0)
                .platformAverageCo2(Math.round(platformAvg * 100.0) / 100.0)
                .userCategoryTotals(userCategoryTotals)
                .platformCategoryAverages(platformCategoryAverages)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public LeaderboardDTO getPercentile(User user) {
        List<Object[]> rankings = activityLogRepository.getAllUsersFootprintRanking();
        int totalUsers = rankings.size();
        if (totalUsers == 0) {
            return LeaderboardDTO.builder()
                    .userRank(1)
                    .totalUsers(1)
                    .userPercentile(100.0)
                    .build();
        }

        int rank = 1;
        for (int i = 0; i < totalUsers; i++) {
            Long userId = (Long) rankings.get(i)[0];
            if (userId != null && userId.equals(user.getId())) {
                rank = i + 1;
                break;
            }
        }

        // Percentile: lower emission is better (so rank 1 is the best/highest percentile)
        double percentile = ((double) (totalUsers - rank + 1) / totalUsers) * 100.0;

        return LeaderboardDTO.builder()
                .userRank(rank)
                .totalUsers(totalUsers)
                .userPercentile(Math.round(percentile * 100.0) / 100.0)
                .build();
    }
}
