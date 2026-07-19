package com.carbontrack.repository;

import com.carbontrack.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByInviteCode(String inviteCode);
    Optional<Organization> findByName(String name);
}
