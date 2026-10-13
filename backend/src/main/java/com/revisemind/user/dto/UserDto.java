package com.revisemind.user.dto;

import com.revisemind.user.User;
import java.time.Instant;
import java.util.UUID;

public record UserDto(
    UUID id,
    String name,
    String email,
    String timeZone,
    Instant createdAt
) {
    public static UserDto fromEntity(User user) {
        return new UserDto(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getTimeZone(),
            user.getCreatedAt()
        );
    }
}
