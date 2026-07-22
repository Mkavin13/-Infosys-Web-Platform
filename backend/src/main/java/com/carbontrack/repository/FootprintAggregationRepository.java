package com.carbontrack.repository;

import com.carbontrack.dto.FootprintSummaryDTO;
import com.carbontrack.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FootprintAggregationRepository extends JpaRepository<ActivityLog, Long> {

    @Query("SELECT new com.carbontrack.dto.FootprintSummaryDTO(a.category, a.logDate, SUM(a.calculatedCo2e), COUNT(a.id)) " +
           "FROM ActivityLog a " +
           "WHERE a.user.id = :userId " +
           "AND a.logDate BETWEEN :startDate AND :endDate " +
           "GROUP BY a.category, a.logDate " +
           "ORDER BY a.logDate ASC, a.category ASC")
    List<FootprintSummaryDTO> aggregateFootprint(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
