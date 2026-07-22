package com.carbontrack.service;

import com.carbontrack.dto.GoalDto;
import com.carbontrack.dto.GoalRequest;
import com.carbontrack.entity.ActivityCategory;
import com.carbontrack.entity.Goal;
import com.carbontrack.entity.User;
import com.carbontrack.exception.ResourceNotFoundException;
import com.carbontrack.repository.ActivityLogRepository;
import com.carbontrack.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final ActivityLogRepository activityLogRepository;
    private final BadgeService badgeService;

    @Transactional
    public GoalDto createGoal(GoalRequest request, User user) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after or equal to start date");
        }

        Long userId = user.getId();
        
        // Calculate goal period length
        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        if (days <= 0) days = 30; // fallback

        // Calculate baseline period (lookback matching timeframe)
        LocalDate baselineStart = request.getStartDate().minusDays(days);
        LocalDate baselineEnd = request.getStartDate().minusDays(1);

        double baseline = 0.0;
        if (request.getTargetCategory() == null) {
            // Overall footprint baseline
            Double val = activityLogRepository.getCo2eByUserIdAndDateRange(userId, baselineStart, baselineEnd);
            baseline = val != null ? val : 500.0; // Fallback: 500kg CO2e baseline budget
        } else {
            // Category specific baseline
            List<Object[]> rows = activityLogRepository.getCategoryBreakdownByUserIdAndDateRange(userId, baselineStart, baselineEnd);
            for (Object[] row : rows) {
                ActivityCategory cat = (ActivityCategory) row[0];
                Double amt = (Double) row[1];
                if (cat == request.getTargetCategory() && amt != null) {
                    baseline = amt;
                }
            }
            if (baseline == 0.0) {
                baseline = 150.0; // Fallback category budget: 150kg CO2e
            }
        }

        double targetValue = baseline * (1.0 - (request.getTargetReductionPercentage() / 100.0));

        Goal goal = Goal.builder()
                .user(user)
                .targetCategory(request.getTargetCategory())
                .targetReductionPercentage(request.getTargetReductionPercentage())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .targetValue(Math.round(targetValue * 100.0) / 100.0)
                .currentValue(0.0)
                .status("ACTIVE")
                .build();

        Goal saved = goalRepository.save(goal);
        return mapToDto(saved);
    }

    @Transactional
    public List<GoalDto> getGoals(User user) {
        List<Goal> goals = goalRepository.findByUserIdOrderByStartDateDesc(user.getId());
        LocalDate today = LocalDate.now();

        for (Goal goal : goals) {
            if ("ACTIVE".equalsIgnoreCase(goal.getStatus())) {
                // Calculate current actual emissions in the goal range
                Double currentVal = 0.0;
                if (goal.getTargetCategory() == null) {
                    currentVal = activityLogRepository.getCo2eByUserIdAndDateRange(
                            user.getId(), goal.getStartDate(), goal.getEndDate());
                } else {
                    List<Object[]> rows = activityLogRepository.getCategoryBreakdownByUserIdAndDateRange(
                            user.getId(), goal.getStartDate(), goal.getEndDate());
                    for (Object[] row : rows) {
                        ActivityCategory cat = (ActivityCategory) row[0];
                        Double amt = (Double) row[1];
                        if (cat == goal.getTargetCategory() && amt != null) {
                            currentVal = amt;
                        }
                    }
                }
                
                goal.setCurrentValue(currentVal != null ? Math.round(currentVal * 100.0) / 100.0 : 0.0);

                // Transition status if goal period ended
                if (today.isAfter(goal.getEndDate())) {
                    if (goal.getCurrentValue() <= goal.getTargetValue()) {
                        goal.setStatus("COMPLETED");
                        // Award milestone badge
                        badgeService.awardBadgeDirectly(user, "Goal Crusher");
                        
                        // Check if they saved more than 100kg CO2e vs baseline
                        double baseline = goal.getTargetValue() / (1.0 - (goal.getTargetReductionPercentage() / 100.0));
                        double savedAmount = baseline - goal.getCurrentValue();
                        if (savedAmount >= 100.0) {
                            badgeService.awardBadgeDirectly(user, "Carbon Champion");
                        }
                    } else {
                        goal.setStatus("FAILED");
                    }
                    goalRepository.save(goal);
                }
            }
        }

        return goals.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public void deleteGoal(Long goalId, User user) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id: " + goalId));
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You are not authorized to delete this goal");
        }
        goalRepository.delete(goal);
    }

    private GoalDto mapToDto(Goal goal) {
        double progress = 0.0;
        if (goal.getTargetValue() > 0) {
            // progress = percentage of carbon budget used
            progress = (goal.getCurrentValue() / goal.getTargetValue()) * 100.0;
        }

        return GoalDto.builder()
                .id(goal.getId())
                .targetCategory(goal.getTargetCategory() != null ? goal.getTargetCategory().name() : "OVERALL")
                .targetReductionPercentage(goal.getTargetReductionPercentage())
                .startDate(goal.getStartDate())
                .endDate(goal.getEndDate())
                .targetValue(goal.getTargetValue())
                .currentValue(goal.getCurrentValue())
                .progressPercentage(Math.round(progress * 100.0) / 100.0)
                .status(goal.getStatus())
                .build();
    }
}
