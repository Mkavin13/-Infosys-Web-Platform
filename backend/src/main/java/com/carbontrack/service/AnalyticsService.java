package com.carbontrack.service;

import com.carbontrack.dto.*;
import com.carbontrack.entity.ActivityCategory;
import com.carbontrack.entity.Badge;
import com.carbontrack.entity.User;
import com.carbontrack.repository.ActivityLogRepository;
import com.carbontrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AnalyticsSummaryDto getSummary(User user) {
        Long userId = user.getId();
        
        Double totalCo2e = activityLogRepository.getTotalCo2eByUserId(userId);
        if (totalCo2e == null) {
            totalCo2e = 0.0;
        }

        // 1. Category Breakdown
        List<Object[]> breakdownData = activityLogRepository.getCategoryBreakdownByUserId(userId);
        List<CategoryBreakdownDto> breakdown = new ArrayList<>();
        double sum = 0.0;
        
        // Gather all categories to ensure they are represented
        Map<String, Double> categorySums = new HashMap<>();
        for (ActivityCategory cat : ActivityCategory.values()) {
            categorySums.put(cat.name(), 0.0);
        }

        for (Object[] row : breakdownData) {
            ActivityCategory cat = (ActivityCategory) row[0];
            Double amt = (Double) row[1];
            if (amt != null) {
                categorySums.put(cat.name(), amt);
                sum += amt;
            }
        }

        final double finalSum = sum;
        for (Map.Entry<String, Double> entry : categorySums.entrySet()) {
            double amt = entry.getValue();
            double pct = finalSum > 0 ? (amt / finalSum) * 100.0 : 0.0;
            breakdown.add(CategoryBreakdownDto.builder()
                    .category(entry.getKey())
                    .amount(Math.round(amt * 100.0) / 100.0)
                    .percentage(Math.round(pct * 100.0) / 100.0)
                    .build());
        }

        // Sort breakdown by category name for stability
        breakdown.sort(Comparator.comparing(CategoryBreakdownDto::getCategory));

        // 2. Month-over-Month (MoM) Comparison
        LocalDate now = LocalDate.now();
        LocalDate currentMonthStart = now.withDayOfMonth(1);
        LocalDate currentMonthEnd = now;
        LocalDate lastMonthStart = now.minusMonths(1).withDayOfMonth(1);
        LocalDate lastMonthEnd = now.minusMonths(1).withDayOfMonth(now.minusMonths(1).lengthOfMonth());

        Double currentMonthCo2 = activityLogRepository.getCo2eByUserIdAndDateRange(userId, currentMonthStart, currentMonthEnd);
        Double lastMonthCo2 = activityLogRepository.getCo2eByUserIdAndDateRange(userId, lastMonthStart, lastMonthEnd);

        if (currentMonthCo2 == null) currentMonthCo2 = 0.0;
        if (lastMonthCo2 == null) lastMonthCo2 = 0.0;

        double momPctDiff = 0.0;
        if (lastMonthCo2 > 0) {
            momPctDiff = ((currentMonthCo2 - lastMonthCo2) / lastMonthCo2) * 100.0;
        }

        ComparisonDto momComparison = ComparisonDto.builder()
                .userValue(Math.round(currentMonthCo2 * 100.0) / 100.0)
                .comparisonValue(Math.round(lastMonthCo2 * 100.0) / 100.0)
                .percentageDifference(Math.round(momPctDiff * 100.0) / 100.0)
                .build();

        // 3. Peer Comparison (this month)
        Double globalAverage = activityLogRepository.getGlobalAverageCo2eInPeriod(currentMonthStart, currentMonthEnd);
        if (globalAverage == null) globalAverage = 0.0;

        double peerPctDiff = 0.0;
        if (globalAverage > 0) {
            peerPctDiff = ((currentMonthCo2 - globalAverage) / globalAverage) * 100.0;
        }

        ComparisonDto peerComparison = ComparisonDto.builder()
                .userValue(Math.round(currentMonthCo2 * 100.0) / 100.0)
                .comparisonValue(Math.round(globalAverage * 100.0) / 100.0)
                .percentageDifference(Math.round(peerPctDiff * 100.0) / 100.0)
                .build();

        // 4. Earned Badges list
        User persistentUser = userRepository.findById(userId).orElse(user);
        List<String> badges = persistentUser.getBadges().stream()
                .map(Badge::getName)
                .collect(Collectors.toList());

        return AnalyticsSummaryDto.builder()
                .totalCo2e(Math.round(totalCo2e * 100.0) / 100.0)
                .categoryBreakdown(breakdown)
                .momComparison(momComparison)
                .peerComparison(peerComparison)
                .earnedBadges(badges)
                .build();
    }

    @Transactional(readOnly = true)
    public List<WeeklyTrendDto> getWeeklyTrend(User user) {
        Long userId = user.getId();
        LocalDate startDate = LocalDate.now().minusDays(6);
        
        List<Object[]> queryResults = activityLogRepository.getWeeklyTrendByUserId(userId, startDate);
        Map<LocalDate, Double> dateMap = new HashMap<>();
        for (Object[] row : queryResults) {
            LocalDate d = (LocalDate) row[0];
            Double amt = (Double) row[1];
            if (d != null && amt != null) {
                dateMap.put(d, amt);
            }
        }

        List<WeeklyTrendDto> trend = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE, MMM dd");
        
        for (int i = 0; i < 7; i++) {
            LocalDate targetDate = startDate.plusDays(i);
            Double val = dateMap.getOrDefault(targetDate, 0.0);
            trend.add(WeeklyTrendDto.builder()
                    .date(targetDate.format(formatter))
                    .amount(Math.round(val * 100.0) / 100.0)
                    .build());
        }

        return trend;
    }

    @Transactional(readOnly = true)
    public List<RecommendationDto> getRecommendations(User user) {
        Long userId = user.getId();
        List<Object[]> breakdownData = activityLogRepository.getCategoryBreakdownByUserId(userId);
        
        ActivityCategory highestCat = null;
        double maxVal = -1.0;
        
        for (Object[] row : breakdownData) {
            ActivityCategory cat = (ActivityCategory) row[0];
            Double amt = (Double) row[1];
            if (cat != null && amt != null && amt > maxVal) {
                maxVal = amt;
                highestCat = cat;
            }
        }

        List<RecommendationDto> recommendations = new ArrayList<>();

        if (highestCat == null) {
            // General onboarding tip
            recommendations.add(RecommendationDto.builder()
                    .category("ALL")
                    .tip("Establish your environmental footprint baseline by logging your first commute, meal, or utility activity.")
                    .estimatedSavings("Up to 50kg CO2e / week")
                    .actionKey("log_first_activity")
                    .build());
            return recommendations;
        }

        switch (highestCat) {
            case TRANSPORT:
                recommendations.add(RecommendationDto.builder()
                        .category("TRANSPORT")
                        .tip("Public transit is highly optimized. Swap single-passenger petrol commutes for train/bus travel to cut emissions.")
                        .estimatedSavings("Saves ~20kg CO2e per 100km")
                        .actionKey("use_public_transit")
                        .build());
                recommendations.add(RecommendationDto.builder()
                        .category("TRANSPORT")
                        .tip("If traveling short distances (< 5km), try walking or using a bicycle instead of driving a vehicle.")
                        .estimatedSavings("Saves ~10kg CO2e per trip")
                        .actionKey("bike_short_commute")
                        .build());
                break;
            case ELECTRICITY:
                recommendations.add(RecommendationDto.builder()
                        .category("ELECTRICITY")
                        .tip("Grid electricity emissions are high. Unplug chargers and turn off background hardware when not in use.")
                        .estimatedSavings("Saves ~8kg CO2e / week")
                        .actionKey("led_bulbs")
                        .build());
                recommendations.add(RecommendationDto.builder()
                        .category("ELECTRICITY")
                        .tip("Consider switching to a renewable energy provider or subscribing to local solar initiatives.")
                        .estimatedSavings("Saves ~120kg CO2e / month")
                        .actionKey("solar_panels")
                        .build());
                break;
            case FOOD:
                recommendations.add(RecommendationDto.builder()
                        .category("FOOD")
                        .tip("Red meat (beef, lamb) has exceptionally high methane impacts. Replace beef with poultry or seafood twice a week.")
                        .estimatedSavings("Saves ~15kg CO2e / meal")
                        .actionKey("swap_red_meat")
                        .build());
                recommendations.add(RecommendationDto.builder()
                        .category("FOOD")
                        .tip("Try integrating plant-based (vegan or vegetarian) lunches into your schedule to unlock your Plant Power badge.")
                        .estimatedSavings("Saves ~5kg CO2e / meal")
                        .actionKey("vegetarian_meals")
                        .build());
                break;
            case SHOPPING:
                recommendations.add(RecommendationDto.builder()
                        .category("SHOPPING")
                        .tip("Manufacturing consumer items (especially electronics) is resource-intensive. Invest in repairable or pre-owned goods.")
                        .estimatedSavings("Saves ~30kg CO2e / item")
                        .actionKey("secondhand_shopping")
                        .build());
                recommendations.add(RecommendationDto.builder()
                        .category("SHOPPING")
                        .tip("Evaluate purchases using a 48-hour delay rule to reduce impulse shopping of low-lifecycle goods.")
                        .estimatedSavings("Saves ~15kg CO2e / month")
                        .actionKey("minimize_shopping")
                        .build());
                break;
        }

        return recommendations;
    }
}
