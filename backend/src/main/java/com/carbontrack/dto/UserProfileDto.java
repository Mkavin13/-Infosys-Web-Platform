package com.carbontrack.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {
    private String username;
    private String preferredUnit;
    private Boolean goalsVisible;
    private String organizationName;
    private String role;
}
