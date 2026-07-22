package com.carbontrack.event;

import com.carbontrack.entity.User;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import java.time.LocalDate;

@Getter
@RequiredArgsConstructor
public class ActivityLoggedEvent {
    private final User user;
    private final LocalDate logDate;
    private final Double co2e;
}
