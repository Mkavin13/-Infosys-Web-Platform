package com.carbontrack.service;

import com.carbontrack.dto.GoalAlertDTO;
import com.carbontrack.dto.GoalProgressDTO;
import com.carbontrack.entity.Goal;
import com.carbontrack.entity.User;
import com.carbontrack.repository.GoalRepository;
import com.carbontrack.service.impl.GoalManagementServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GoalManagementServiceTest {

    @Mock
    private GoalRepository goalRepository;

    private GoalManagementService goalManagementService;

    @BeforeEach
    void setUp() {
        goalManagementService = new GoalManagementServiceImpl(goalRepository);
    }

    @Test
    void testCalculateProgressOnTrack() {
        Long goalId = 1L;
        User user = User.builder().id(100L).username("test_user").build();
        
        Goal goal = Goal.builder()
                .id(goalId)
                .user(user)
                .startDate(LocalDate.now().minusDays(5))
                .endDate(LocalDate.now().plusDays(5))
                .targetReductionPercentage(10.0)
                .targetValue(90.0) // baseline would be 100.0
                .currentValue(40.0) // half way through, limit is 95.0, so they are well on track / ahead
                .status("ACTIVE")
                .build();

        when(goalRepository.findById(goalId)).thenReturn(Optional.of(goal));

        GoalProgressDTO progress = goalManagementService.calculateProgress(goalId, user);

        assertNotNull(progress);
        assertEquals(90.0, progress.getTargetValue());
        assertEquals(40.0, progress.getCurrentValue());
        assertTrue(progress.getTrackStatus().equals("AHEAD_OF_SCHEDULE") || progress.getTrackStatus().equals("ON_TRACK"));
    }

    @Test
    void testCalculateProgressBehind() {
        Long goalId = 1L;
        User user = User.builder().id(100L).username("test_user").build();

        Goal goal = Goal.builder()
                .id(goalId)
                .user(user)
                .startDate(LocalDate.now().minusDays(5))
                .endDate(LocalDate.now().plusDays(5))
                .targetReductionPercentage(10.0)
                .targetValue(90.0) // baseline would be 100.0
                .currentValue(98.0) // exceeded budget limit!
                .status("ACTIVE")
                .build();

        when(goalRepository.findById(goalId)).thenReturn(Optional.of(goal));

        GoalProgressDTO progress = goalManagementService.calculateProgress(goalId, user);

        assertNotNull(progress);
        assertEquals("BEHIND_SCHEDULE", progress.getTrackStatus());

        GoalAlertDTO alert = goalManagementService.getAlert(goalId, user);
        assertEquals("CORRECTION", alert.getAlertType());
    }
}
