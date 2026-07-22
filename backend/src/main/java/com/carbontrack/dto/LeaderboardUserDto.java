package com.carbontrack.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardUserDto {
    private Long userId;
    private String username;
    private String organizationName;
    private Double totalCo2e;
    private Integer rank;
    private List<String> badges;
}
