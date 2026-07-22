package com.carbontrack.service;

import com.carbontrack.dto.ActivityLogDto;
import com.carbontrack.dto.ActivityLogRequest;
import com.carbontrack.entity.ActivityCategory;
import com.carbontrack.entity.ActivityLog;
import com.carbontrack.entity.Role;
import com.carbontrack.entity.User;
import com.carbontrack.exception.ResourceNotFoundException;
import com.carbontrack.repository.ActivityLogRepository;
import com.carbontrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.cache.annotation.CacheEvict;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final EmissionCalculationService emissionCalculationService;
    private final BadgeService badgeService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    @CacheEvict(value = {"dailySummary", "weeklySummary", "monthlySummary", "recommendations", "leaderboard"}, allEntries = true)
    public ActivityLogDto createLog(ActivityLogRequest request, User user) {
        double co2e = emissionCalculationService.calculateCo2e(
                request.getCategory(),
                request.getActivityType(),
                request.getQuantity()
        );

        ActivityLog log = ActivityLog.builder()
                .user(user)
                .category(request.getCategory())
                .activityType(request.getActivityType())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .logDate(request.getLogDate())
                .calculatedCo2e(co2e)
                .build();

        ActivityLog saved = activityLogRepository.save(log);

        badgeService.evaluateBadges(user);

        // Publish event for achievements evaluation
        eventPublisher.publishEvent(new com.carbontrack.event.ActivityLoggedEvent(user, saved.getLogDate(), saved.getCalculatedCo2e()));
        
        eventPublisher.publishEvent(new com.carbontrack.event.UserActiveEvent(this, user.getUsername()));

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<ActivityLogDto> getLogs(User user, Pageable pageable) {
        User persistentUser = userRepository.findById(user.getId()).orElse(user);
        if (persistentUser.getRole() == Role.ADMIN) {
            return activityLogRepository.findAllByOrderByLogDateDesc(pageable)
                    .map(this::mapToDto);
        } else if (persistentUser.getRole() == Role.ORG_ADMIN) {
            if (persistentUser.getOrganization() != null) {
                return activityLogRepository.findByUserOrganizationIdOrderByLogDateDesc(
                        persistentUser.getOrganization().getId(), pageable)
                        .map(this::mapToDto);
            }
        }
        return activityLogRepository.findByUserIdOrderByLogDateDesc(persistentUser.getId(), pageable)
                .map(this::mapToDto);
    }

    @Transactional
    @CacheEvict(value = {"dailySummary", "weeklySummary", "monthlySummary", "recommendations", "leaderboard"}, allEntries = true)
    public ActivityLogDto updateLog(Long id, ActivityLogRequest request, User user) {
        ActivityLog existing = activityLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity log not found with id: " + id));

        if (!existing.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You are not authorized to update this log");
        }

        double co2e = emissionCalculationService.calculateCo2e(
                request.getCategory(),
                request.getActivityType(),
                request.getQuantity()
        );

        existing.setCategory(request.getCategory());
        existing.setActivityType(request.getActivityType());
        existing.setQuantity(request.getQuantity());
        existing.setUnit(request.getUnit());
        existing.setLogDate(request.getLogDate());
        existing.setCalculatedCo2e(co2e);

        ActivityLog updated = activityLogRepository.save(existing);
        
        // Evaluate badges on update as well
        badgeService.evaluateBadges(user);

        // Publish event for achievements evaluation
        eventPublisher.publishEvent(new com.carbontrack.event.ActivityLoggedEvent(user, updated.getLogDate(), updated.getCalculatedCo2e()));

        eventPublisher.publishEvent(new com.carbontrack.event.UserActiveEvent(this, user.getUsername()));

        return mapToDto(updated);
    }

    @Transactional
    @CacheEvict(value = {"dailySummary", "weeklySummary", "monthlySummary", "recommendations", "leaderboard"}, allEntries = true)
    public void deleteLog(Long id, User user) {
        ActivityLog existing = activityLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity log not found with id: " + id));

        if (!existing.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You are not authorized to delete this log");
        }

        activityLogRepository.delete(existing);
    }

    private ActivityLogDto mapToDto(ActivityLog log) {
        return ActivityLogDto.builder()
                .id(log.getId())
                .category(log.getCategory().name())
                .activityType(log.getActivityType())
                .quantity(log.getQuantity())
                .unit(log.getUnit())
                .logDate(log.getLogDate())
                .calculatedCo2e(log.getCalculatedCo2e())
                .build();
    }
}
