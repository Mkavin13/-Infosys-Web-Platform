package com.carbontrack.controller;

import com.carbontrack.dto.BadgeDTO;
import com.carbontrack.entity.User;
import com.carbontrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<BadgeDTO>> getMyBadges(@AuthenticationPrincipal User user) {
        User persistentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<BadgeDTO> list = persistentUser.getBadges().stream()
                .map(badge -> BadgeDTO.builder()
                        .id(badge.getId())
                        .name(badge.getName())
                        .description(badge.getDescription())
                        .icon(badge.getIcon())
                        .criteriaType(badge.getCriteriaType())
                        .criteriaValue(badge.getCriteriaValue())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }
}
