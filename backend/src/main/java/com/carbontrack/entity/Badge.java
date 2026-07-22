package com.carbontrack.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, length = 100)
    private String icon;

    @Column(name = "criteria_type", nullable = false, length = 100)
    private String criteriaType;

    @Column(name = "criteria_value", nullable = false)
    private Double criteriaValue;
}
