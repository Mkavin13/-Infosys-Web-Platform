package com.carbontrack.event;

import com.carbontrack.entity.User;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class BadgeAwardedEvent {
    private final User user;
    private final String badgeName;
}
