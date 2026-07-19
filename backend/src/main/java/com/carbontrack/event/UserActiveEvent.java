package com.carbontrack.event;

import org.springframework.context.ApplicationEvent;

public class UserActiveEvent extends ApplicationEvent {
    private final String username;

    public UserActiveEvent(Object source, String username) {
        super(source);
        this.username = username;
    }

    public String getUsername() {
        return username;
    }
}
