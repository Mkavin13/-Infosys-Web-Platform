package com.carbontrack.service.impl;

import com.carbontrack.entity.Badge;
import com.carbontrack.entity.User;
import com.carbontrack.repository.ActivityLogRepository;
import com.carbontrack.repository.BadgeRepository;
import com.carbontrack.repository.UserRepository;
import com.carbontrack.service.BadgeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeServiceImpl implements BadgeService {

    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final ActivityLogRepository activityLogRepository;

    @Override
    @Transactional
    public void evaluateBadges(User user) {
        User persistentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + user.getId()));
        
        Set<Badge> earnedBadges = persistentUser.getBadges();
        List<Badge> allBadges = badgeRepository.findAll();

        long totalLogs = activityLogRepository.countByUserId(persistentUser.getId());
        long plantMeals = activityLogRepository.countPlantBasedMealsByUserId(persistentUser.getId());
        long lowEmissionRides = activityLogRepository.countLowEmissionTransportByUserId(persistentUser.getId());

        boolean updated = false;

        for (Badge badge : allBadges) {
            if (earnedBadges.contains(badge)) {
                continue;
            }

            boolean qualify = false;
            switch (badge.getCriteriaType()) {
                case "TOTAL_LOGS":
                    if (totalLogs >= badge.getCriteriaValue()) {
                        qualify = true;
                    }
                    break;
                case "PLANT_MEALS":
                    if (plantMeals >= badge.getCriteriaValue()) {
                        qualify = true;
                    }
                    break;
                case "LOW_EMISSION_TRANSPORT":
                    if (lowEmissionRides >= badge.getCriteriaValue()) {
                        qualify = true;
                    }
                    break;
                case "GOALS_COMPLETED":
                    break;
                case "TOTAL_SAVED_CO2":
                    break;
            }

            if (qualify) {
                earnedBadges.add(badge);
                updated = true;
                log.info("User {} earned badge: {}", persistentUser.getUsername(), badge.getName());
            }
        }

        if (updated) {
            userRepository.save(persistentUser);
        }
    }

    @Override
    @Transactional
    public void awardBadgeDirectly(User user, String badgeName) {
        User persistentUser = userRepository.findById(user.getId()).orElse(null);
        if (persistentUser == null) return;

        Badge badge = badgeRepository.findByName(badgeName).orElse(null);
        if (badge != null && !persistentUser.getBadges().contains(badge)) {
            persistentUser.getBadges().add(badge);
            userRepository.save(persistentUser);
            log.info("User {} earned badge directly: {}", persistentUser.getUsername(), badgeName);
        }
    }
}
