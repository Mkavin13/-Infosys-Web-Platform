package com.carbontrack.repository;

import com.carbontrack.entity.ActivityCategory;
import com.carbontrack.entity.EmissionFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmissionFactorRepository extends JpaRepository<EmissionFactor, Long> {
    Optional<EmissionFactor> findByActivityType(String activityType);
    List<EmissionFactor> findByCategory(ActivityCategory category);
}
