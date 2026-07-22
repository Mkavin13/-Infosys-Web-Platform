package com.carbontrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalAlertDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private String alertType; // ENCOURAGEMENT, CORRECTION
    private String message;
}
