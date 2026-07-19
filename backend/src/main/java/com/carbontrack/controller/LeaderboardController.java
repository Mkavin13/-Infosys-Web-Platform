package com.carbontrack.controller;

import com.carbontrack.dto.LeaderboardUserDto;
import com.carbontrack.entity.User;
import com.carbontrack.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<List<LeaderboardUserDto>> getGlobalLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard());
    }

    @GetMapping("/org")
    public ResponseEntity<List<LeaderboardUserDto>> getOrgLeaderboard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(leaderboardService.getOrgLeaderboard(user));
    }
}
