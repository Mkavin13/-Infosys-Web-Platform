package com.carbontrack.controller;

import com.carbontrack.dto.ActivityLogDto;
import com.carbontrack.dto.ActivityLogRequest;
import com.carbontrack.entity.User;
import com.carbontrack.service.ActivityLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @PostMapping
    public ResponseEntity<ActivityLogDto> createLog(
            @Valid @RequestBody ActivityLogRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(activityLogService.createLog(request, user));
    }

    @GetMapping
    public ResponseEntity<Page<ActivityLogDto>> getLogs(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(activityLogService.getLogs(user, pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivityLogDto> updateLog(
            @PathVariable Long id,
            @Valid @RequestBody ActivityLogRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(activityLogService.updateLog(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        activityLogService.deleteLog(id, user);
        return ResponseEntity.noContent().build();
    }
}
