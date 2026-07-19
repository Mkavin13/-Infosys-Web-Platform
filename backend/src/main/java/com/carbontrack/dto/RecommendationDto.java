package com.carbontrack.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationDto {
    private String category;
    private String tip;
    private String estimatedSavings;
    private String actionKey; // e.g. use_public_transit, reduce_beef
}
