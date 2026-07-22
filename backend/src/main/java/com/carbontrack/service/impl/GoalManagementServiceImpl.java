package com.carbontrack.service.impl;

import com.carbontrack.dto.GoalAlertDTO;
import com.carbontrack.dto.GoalProgressDTO;
import com.carbontrack.entity.Goal;
import com.carbontrack.entity.User;
import com.carbontrack.exception.ResourceNotFoundException;
import com.carbontrack.repository.GoalRepository;
import com.carbontrack.service.GoalManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class GoalManagementServiceImpl implements GoalManagementService {

    private final GoalRepository goalRepository;

    @Override
    @Transactional(readOnly = true)
    public GoalProgressDTO calculateProgress(Long goalId, User user) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id: " + goalId));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized to view this goal");
        }

        long totalDays = ChronoUnit.DAYS.between(goal.getStartDate(), goal.getEndDate()) + 1;
        long daysElapsed = ChronoUnit.DAYS.between(goal.getStartDate(), LocalDate.now());
        
        // Clamp values
        if (daysElapsed < 0) daysElapsed = 0;
        if (daysElapsed > totalDays) daysElapsed = totalDays;

        double progressPercentage = 0.0;
        if (goal.getTargetValue() > 0) {
            progressPercentage = (goal.getCurrentValue() / goal.getTargetValue()) * 100.0;
        }

        // Remaining reduction target
        double remainingReduction = Math.max(0.0, goal.getTargetValue() - goal.getCurrentValue());

        // Linear schedule check
        double baseline = goal.getTargetValue() / (1.0 - (goal.getTargetReductionPercentage() / 100.0));
        double allowedEmissionsFraction = totalDays > 0 ? (double) daysElapsed / totalDays : 1.0;
        double allowedEmissionsLimitToday = baseline - (baseline - goal.getTargetValue()) * allowedEmissionsFraction;

        String trackStatus;
        if (goal.getCurrentValue() <= goal.getTargetValue() * allowedEmissionsFraction * 0.9) {
            trackStatus = "AHEAD_OF_SCHEDULE";
        } else if (goal.getCurrentValue() <= allowedEmissionsLimitToday) {
            trackStatus = "ON_TRACK";
        } else {
            trackStatus = "BEHIND_SCHEDULE";
        }

        // Expected Completion Date calculation (when they will hit targetValue budget limit)
        LocalDate expectedCompletionDate = null;
        if (daysElapsed > 0 && goal.getCurrentValue() > 0) {
            double avgEmissionsPerDay = goal.getCurrentValue() / daysElapsed;
            if (avgEmissionsPerDay > 0) {
                long daysToHitLimit = Math.round(goal.getTargetValue() / avgEmissionsPerDay);
                expectedCompletionDate = goal.getStartDate().plusDays(daysToHitLimit);
            }
        }
        if (expectedCompletionDate == null) {
            expectedCompletionDate = goal.getEndDate();
        }

        return GoalProgressDTO.builder()
                .goalId(goal.getId())
                .currentValue(Math.round(goal.getCurrentValue() * 100.0) / 100.0)
                .targetValue(Math.round(goal.getTargetValue() * 100.0) / 100.0)
                .progressPercentage(Math.round(progressPercentage * 100.0) / 100.0)
                .remainingReduction(Math.round(remainingReduction * 100.0) / 100.0)
                .trackStatus(trackStatus)
                .expectedCompletionDate(expectedCompletionDate)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public GoalAlertDTO getAlert(Long goalId, User user) {
        GoalProgressDTO progress = calculateProgress(goalId, user);
        String alertType;
        String message;

        if ("BEHIND_SCHEDULE".equals(progress.getTrackStatus())) {
            alertType = "CORRECTION";
            message = "Warning: Your footprint is accumulating faster than allowed under your reduction schedule. Try swapping out a car trip or meat-based meal to stay within budget!";
        } else if ("AHEAD_OF_SCHEDULE".equals(progress.getTrackStatus())) {
            alertType = "ENCOURAGEMENT";
            message = "Incredible work! You are significantly ahead of schedule in saving CO2 emissions. Keep making those green choices!";
        } else {
            alertType = "ENCOURAGEMENT";
            message = "Great progress! You are perfectly on track to satisfy your carbon budget target by the deadline.";
        }

        return GoalAlertDTO.builder()
                .alertType(alertType)
                .message(message)
                .build();
    }
}
