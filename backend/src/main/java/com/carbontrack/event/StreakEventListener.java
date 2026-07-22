package com.carbontrack.event;

import com.carbontrack.entity.User;
import com.carbontrack.repository.UserRepository;
import com.carbontrack.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class StreakEventListener {

    private final UserRepository userRepository;
    private final BadgeService badgeService;

    @Async
    @EventListener
    @Transactional
    public void handleUserActiveEvent(UserActiveEvent event) {
        userRepository.findByUsername(event.getUsername()).ifPresent(user -> {
            LocalDate today = LocalDate.now();
            LocalDate lastActive = user.getLastActiveDate();

            if (lastActive == null) {
                user.setCurrentStreak(1);
            } else if (lastActive.equals(today)) {
                // Already active today, streak is maintained, do nothing
                return;
            } else if (lastActive.equals(today.minusDays(1))) {
                user.setCurrentStreak(user.getCurrentStreak() + 1);
            } else {
                user.setCurrentStreak(1);
            }

            user.setLastActiveDate(today);
            userRepository.save(user);

            if (user.getCurrentStreak() >= 30) {
                badgeService.awardBadgeDirectly(user, "30-Day Streak");
            } else if (user.getCurrentStreak() >= 7) {
                badgeService.awardBadgeDirectly(user, "7-Day Streak");
            }
        });
    }
}
