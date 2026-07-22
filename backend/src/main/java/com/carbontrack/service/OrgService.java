package com.carbontrack.service;

import com.carbontrack.dto.CategoryBreakdownDto;
import com.carbontrack.dto.LeaderboardUserDto;
import com.carbontrack.dto.OrgSummaryDto;
import com.carbontrack.entity.ActivityCategory;
import com.carbontrack.entity.Badge;
import com.carbontrack.entity.Organization;
import com.carbontrack.entity.User;
import com.carbontrack.repository.ActivityLogRepository;
import com.carbontrack.repository.OrganizationRepository;
import com.carbontrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrgService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;

    @Transactional(readOnly = true)
    public OrgSummaryDto getOrgSummary(User user) {
        User persistentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Organization org = persistentUser.getOrganization();
        if (org == null) {
            throw new IllegalArgumentException("User is not associated with any organization");
        }

        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end = LocalDate.now();

        // 1. Fetch organization members to calculate count
        // For simplicity, we can load user list or query count.
        List<User> members = userRepository.findAll().stream()
                .filter(u -> u.getOrganization() != null && u.getOrganization().getId().equals(org.getId()))
                .collect(Collectors.toList());
        int memberCount = members.size();

        // 2. Total CO2e for the org this month
        Double totalCo2e = activityLogRepository.getOrgTotalCo2eInPeriod(org.getId(), start, end);
        if (totalCo2e == null) {
            totalCo2e = 0.0;
        }

        // 3. Category Breakdown
        List<Object[]> breakdownData = activityLogRepository.getOrgCategoryBreakdownInPeriod(org.getId(), start, end);
        List<CategoryBreakdownDto> breakdown = new ArrayList<>();
        double sum = 0.0;

        Map<String, Double> categorySums = new HashMap<>();
        for (ActivityCategory cat : ActivityCategory.values()) {
            categorySums.put(cat.name(), 0.0);
        }

        for (Object[] row : breakdownData) {
            ActivityCategory cat = (ActivityCategory) row[0];
            Double amt = (Double) row[1];
            if (amt != null) {
                categorySums.put(cat.name(), amt);
                sum += amt;
            }
        }

        final double finalSum = sum;
        for (Map.Entry<String, Double> entry : categorySums.entrySet()) {
            double amt = entry.getValue();
            double pct = finalSum > 0 ? (amt / finalSum) * 100.0 : 0.0;
            breakdown.add(CategoryBreakdownDto.builder()
                    .category(entry.getKey())
                    .amount(Math.round(amt * 100.0) / 100.0)
                    .percentage(Math.round(pct * 100.0) / 100.0)
                    .build());
        }
        breakdown.sort(Comparator.comparing(CategoryBreakdownDto::getCategory));

        // 4. Employee rankings
        List<Object[]> rows = activityLogRepository.getOrgLeaderboard(org.getId(), start, end);
        List<LeaderboardUserDto> employees = new ArrayList<>();
        int rank = 1;

        for (Object[] row : rows) {
            Long empId = (Long) row[0];
            String empUsername = (String) row[1];
            Double empTotal = (Double) row[2];

            if (empId == null) continue;

            User u = userRepository.findById(empId).orElse(null);
            if (u == null) continue;

            List<String> badges = u.getBadges().stream()
                    .map(Badge::getName)
                    .collect(Collectors.toList());

            employees.add(LeaderboardUserDto.builder()
                    .userId(empId)
                    .username(empUsername)
                    .organizationName(org.getName())
                    .totalCo2e(empTotal != null ? Math.round(empTotal * 100.0) / 100.0 : 0.0)
                    .rank(rank++)
                    .badges(badges)
                    .build());
        }

        return OrgSummaryDto.builder()
                .orgName(org.getName())
                .inviteCode(org.getInviteCode())
                .memberCount(memberCount)
                .totalCo2e(Math.round(totalCo2e * 100.0) / 100.0)
                .categoryBreakdown(breakdown)
                .employeeFootprints(employees)
                .build();
    }
}
