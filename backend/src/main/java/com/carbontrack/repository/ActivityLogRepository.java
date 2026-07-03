package com.carbontrack.repository;

import com.carbontrack.entity.ActivityCategory;
import com.carbontrack.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    Page<ActivityLog> findByUserIdOrderByLogDateDesc(Long userId, Pageable pageable);

    @Query("SELECT SUM(a.calculatedCo2e) FROM ActivityLog a WHERE a.user.id = :userId")
    Double getTotalCo2eByUserId(@Param("userId") Long userId);

    @Query("SELECT a.category, SUM(a.calculatedCo2e) FROM ActivityLog a WHERE a.user.id = :userId GROUP BY a.category")
    List<Object[]> getCategoryBreakdownByUserId(@Param("userId") Long userId);

    @Query("SELECT a.logDate, SUM(a.calculatedCo2e) FROM ActivityLog a WHERE a.user.id = :userId AND a.logDate >= :startDate GROUP BY a.logDate ORDER BY a.logDate ASC")
    List<Object[]> getWeeklyTrendByUserId(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);

    @Query("SELECT SUM(a.calculatedCo2e) FROM ActivityLog a WHERE a.user.id = :userId AND a.logDate BETWEEN :startDate AND :endDate")
    Double getCo2eByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT a.category, SUM(a.calculatedCo2e) FROM ActivityLog a WHERE a.user.id = :userId AND a.logDate BETWEEN :startDate AND :endDate GROUP BY a.category")
    List<Object[]> getCategoryBreakdownByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Peer average: Average emission across all users in the system in a specific period
    @Query("SELECT SUM(a.calculatedCo2e) / COUNT(DISTINCT a.user.id) FROM ActivityLog a WHERE a.logDate BETWEEN :startDate AND :endDate")
    Double getGlobalAverageCo2eInPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Leaderboard: rank users by their total emissions (lower is better)
    @Query("SELECT u.id, u.username, COALESCE(SUM(a.calculatedCo2e), 0.0) as total " +
           "FROM User u LEFT JOIN ActivityLog a ON u.id = a.user.id AND a.logDate BETWEEN :startDate AND :endDate " +
           "GROUP BY u.id, u.username " +
           "ORDER BY total ASC")
    List<Object[]> getLeaderboard(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Leaderboard within an organization
    @Query("SELECT u.id, u.username, COALESCE(SUM(a.calculatedCo2e), 0.0) as total " +
           "FROM User u LEFT JOIN ActivityLog a ON u.id = a.user.id AND a.logDate BETWEEN :startDate AND :endDate " +
           "WHERE u.organization.id = :orgId " +
           "GROUP BY u.id, u.username " +
           "ORDER BY total ASC")
    List<Object[]> getOrgLeaderboard(@Param("orgId") Long orgId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Org level metrics
    @Query("SELECT SUM(a.calculatedCo2e) FROM ActivityLog a WHERE a.user.organization.id = :orgId AND a.logDate BETWEEN :startDate AND :endDate")
    Double getOrgTotalCo2eInPeriod(@Param("orgId") Long orgId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT a.category, SUM(a.calculatedCo2e) FROM ActivityLog a WHERE a.user.organization.id = :orgId AND a.logDate BETWEEN :startDate AND :endDate GROUP BY a.category")
    List<Object[]> getOrgCategoryBreakdownInPeriod(@Param("orgId") Long orgId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT count(a) FROM ActivityLog a WHERE a.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);

    @Query("SELECT count(a) FROM ActivityLog a WHERE a.user.id = :userId AND a.category = 'FOOD' AND a.activityType IN ('VEGETARIAN', 'VEGAN')")
    Long countPlantBasedMealsByUserId(@Param("userId") Long userId);
}
