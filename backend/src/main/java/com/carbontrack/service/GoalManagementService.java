package com.carbontrack.service;

import com.carbontrack.dto.GoalProgressDTO;
import com.carbontrack.dto.GoalAlertDTO;
import com.carbontrack.entity.User;

public interface GoalManagementService {
    GoalProgressDTO calculateProgress(Long goalId, User user);
    GoalAlertDTO getAlert(Long goalId, User user);
}
