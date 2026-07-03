package com.carbontrack.repository;

import com.carbontrack.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserIdOrderByStartDateDesc(Long userId);
    List<Goal> findByUserIdAndStatus(Long userId, String status);
}
