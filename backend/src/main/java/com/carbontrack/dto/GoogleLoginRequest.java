package com.carbontrack.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleLoginRequest {

    @NotBlank(message = "Google ID token is required")
    private String idToken;

    private String email;      // Fallback/direct input for fast mock login
    private String name;       // Fallback/direct input for fast mock login
}
