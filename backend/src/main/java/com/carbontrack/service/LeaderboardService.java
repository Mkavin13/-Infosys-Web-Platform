package com.carbontrack.service;

import com.carbontrack.dto.LeaderboardUserDto;
import com.carbontrack.entity.Badge;
import com.carbontrack.entity.User;
import com.carbontrack.repository.ActivityLogRepository;
import com.carbontrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "leaderboard", key = "'global'")
    public List<LeaderboardUserDto> getGlobalLeaderboard() {
        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end = LocalDate.now();

        List<Object[]> rows = activityLogRepository.getLeaderboard(start, end);
        return mapToLeaderboardDtos(rows);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "leaderboard", key = "'org_' + #user.id")
    public List<LeaderboardUserDto> getOrgLeaderboard(User user) {
        // Re-fetch user to get loaded organization proxy
        User persistentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (persistentUser.getOrganization() == null) {
            throw new IllegalArgumentException("You are not part of any organization. Ask your admin for an invite code!");
        }

        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end = LocalDate.now();

        List<Object[]> rows = activityLogRepository.getOrgLeaderboard(
                persistentUser.getOrganization().getId(), start, end);
        
        return mapToLeaderboardDtos(rows);
    }

    private List<LeaderboardUserDto> mapToLeaderboardDtos(List<Object[]> rows) {
        List<LeaderboardUserDto> leaderboard = new ArrayList<>();
        int rank = 1;

        for (Object[] row : rows) {
            Long userId = (Long) row[0];
            String username = (String) row[1];
            Double totalCo2e = (Double) row[2];

            if (userId == null) continue;

            // Fetch the user to get badges and organization
            User u = userRepository.findById(userId).orElse(null);
            if (u == null) continue;

            List<String> badges = u.getBadges().stream()
                    .map(Badge::getName)
                    .collect(Collectors.toList());

            leaderboard.add(LeaderboardUserDto.builder()
                    .userId(userId)
                    .username(username)
                    .organizationName(u.getOrganization() != null ? u.getOrganization().getName() : "Independent")
                    .totalCo2e(totalCo2e != null ? Math.round(totalCo2e * 100.0) / 100.0 : 0.0)
                    .rank(rank++)
                    .badges(badges)
                    .build());
        }

        return leaderboard;
    }
}
