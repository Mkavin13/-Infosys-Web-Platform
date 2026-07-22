package com.carbontrack.event;

import com.carbontrack.entity.Goal;
import com.carbontrack.entity.User;
import com.carbontrack.repository.ActivityLogRepository;
import com.carbontrack.repository.GoalRepository;
import com.carbontrack.service.BadgeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BadgeEventListener {

    private final BadgeService badgeService;
    private final ActivityLogRepository activityLogRepository;
    private final GoalRepository goalRepository;
    private final ApplicationEventPublisher eventPublisher;

    @EventListener
    public void handleActivityLogged(ActivityLoggedEvent event) {
        User user = event.getUser();
        log.info("Processing achievements for user: {}", user.getUsername());

        // 1. Check 7-Day Logging Streak
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(6);
        Long distinctDays = activityLogRepository.countDistinctLogDatesInPeriod(user.getId(), sevenDaysAgo);
        if (distinctDays != null && distinctDays >= 7) {
            badgeService.awardBadgeDirectly(user, "7-Day Logging Streak");
            eventPublisher.publishEvent(new BadgeAwardedEvent(user, "7-Day Logging Streak"));
        }

        // 2. Check Completed Goals Achievements
        List<Goal> completedGoals = goalRepository.findByUserIdAndStatus(user.getId(), "COMPLETED");
        if (!completedGoals.isEmpty()) {
            badgeService.awardBadgeDirectly(user, "First Goal Achieved");
            eventPublisher.publishEvent(new BadgeAwardedEvent(user, "First Goal Achieved"));

            // Calculate overall reduction saved across goals
            double totalSaved = 0.0;
            for (Goal goal : completedGoals) {
                double targetPct = goal.getTargetReductionPercentage();
                if (targetPct < 100.0) {
                    double baseline = goal.getTargetValue() / (1.0 - (targetPct / 100.0));
                    totalSaved += Math.max(0.0, baseline - goal.getCurrentValue());
                }
            }

            if (totalSaved >= 10.0) {
                badgeService.awardBadgeDirectly(user, "10 kg Reduction");
                eventPublisher.publishEvent(new BadgeAwardedEvent(user, "10 kg Reduction"));
            }
            if (totalSaved >= 25.0) {
                badgeService.awardBadgeDirectly(user, "25 kg Reduction");
                eventPublisher.publishEvent(new BadgeAwardedEvent(user, "25 kg Reduction"));
            }
            if (totalSaved >= 50.0) {
                badgeService.awardBadgeDirectly(user, "50 kg Reduction");
                eventPublisher.publishEvent(new BadgeAwardedEvent(user, "50 kg Reduction"));
            }
        }

        // 3. Evaluate legacy criteria badges
        badgeService.evaluateBadges(user);
    }

    @EventListener
    public void handleBadgeAwarded(BadgeAwardedEvent event) {
        log.info("CONGRATULATIONS: User '{}' was awarded the badge '{}'!", 
                event.getUser().getUsername(), event.getBadgeName());
    }
}
