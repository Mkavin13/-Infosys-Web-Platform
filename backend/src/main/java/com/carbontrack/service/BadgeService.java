package com.carbontrack.service;

import com.carbontrack.entity.User;

public interface BadgeService {
    void evaluateBadges(User user);
    void awardBadgeDirectly(User user, String badgeName);
}
