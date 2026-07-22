package com.carbontrack.controller;

import com.carbontrack.dto.GoalDto;
import com.carbontrack.dto.GoalRequest;
import com.carbontrack.entity.User;
import com.carbontrack.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;
    private final com.carbontrack.service.GoalManagementService goalManagementService;

    @PostMapping
    public ResponseEntity<GoalDto> createGoal(
            @Valid @RequestBody GoalRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(goalService.createGoal(request, user));
    }

    @GetMapping
    public ResponseEntity<List<GoalDto>> getGoals(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(goalService.getGoals(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        goalService.deleteGoal(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<com.carbontrack.dto.GoalProgressDTO> getGoalProgress(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(goalManagementService.calculateProgress(id, user));
    }

    @GetMapping("/{id}/alerts")
    public ResponseEntity<com.carbontrack.dto.GoalAlertDTO> getGoalAlert(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(goalManagementService.getAlert(id, user));
    }
}
