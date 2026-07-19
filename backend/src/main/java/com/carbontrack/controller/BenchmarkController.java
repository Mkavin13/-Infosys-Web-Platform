package com.carbontrack.controller;

import com.carbontrack.dto.BenchmarkDTO;
import com.carbontrack.dto.LeaderboardDTO;
import com.carbontrack.entity.User;
import com.carbontrack.service.BenchmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/benchmark")
@RequiredArgsConstructor
public class BenchmarkController {

    private final BenchmarkService benchmarkService;

    @GetMapping
    public ResponseEntity<BenchmarkDTO> getBenchmark(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(benchmarkService.getBenchmark(user));
    }

    @GetMapping("/percentile")
    public ResponseEntity<LeaderboardDTO> getPercentile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(benchmarkService.getPercentile(user));
    }
}
