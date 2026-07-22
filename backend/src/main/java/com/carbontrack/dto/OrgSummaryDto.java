package com.carbontrack.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrgSummaryDto {
    private String orgName;
    private String inviteCode;
    private Integer memberCount;
    private Double totalCo2e;
    private List<CategoryBreakdownDto> categoryBreakdown;
    private List<LeaderboardUserDto> employeeFootprints;
}
