package com.carbontrack.controller;

import com.carbontrack.dto.FootprintSummaryDTO;
import com.carbontrack.entity.User;
import com.carbontrack.service.FootprintAggregationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/footprint/summary")
@RequiredArgsConstructor
public class FootprintAggregationController {

    private final FootprintAggregationService footprintAggregationService;

    @GetMapping("/daily")
    public ResponseEntity<List<FootprintSummaryDTO>> getDailySummary(
            @AuthenticationPrincipal User user,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        Long targetUserId = resolveUserId(user, userId);
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        return ResponseEntity.ok(footprintAggregationService.getDailySummary(targetUserId, start, end));
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<FootprintSummaryDTO>> getWeeklySummary(
            @AuthenticationPrincipal User user,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        Long targetUserId = resolveUserId(user, userId);
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusWeeks(12);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        return ResponseEntity.ok(footprintAggregationService.getWeeklySummary(targetUserId, start, end));
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<FootprintSummaryDTO>> getMonthlySummary(
            @AuthenticationPrincipal User user,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        Long targetUserId = resolveUserId(user, userId);
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusMonths(6);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        return ResponseEntity.ok(footprintAggregationService.getMonthlySummary(targetUserId, start, end));
    }

    private Long resolveUserId(User user, Long userId) {
        if (userId != null && !userId.equals(user.getId())) {
            if ("ADMIN".equals(user.getRole().name()) || "ORG_ADMIN".equals(user.getRole().name())) {
                return userId;
            }
            throw new IllegalArgumentException("Unauthorized to view footprint summary for other users");
        }
        return user.getId();
    }
}
