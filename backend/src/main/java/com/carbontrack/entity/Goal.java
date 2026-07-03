package com.carbontrack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_category", length = 50)
    private ActivityCategory targetCategory;

    @Column(name = "target_reduction_percentage", nullable = false)
    private Double targetReductionPercentage;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "target_value", nullable = false)
    private Double targetValue;

    @Column(name = "current_value")
    @Builder.Default
    private Double currentValue = 0.0;

    @Column(nullable = false, length = 50)
    private String status; // ACTIVE, COMPLETED, FAILED

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
