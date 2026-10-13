package com.revisemind.auth.dto;

import com.revisemind.user.dto.UserDto;

public record AuthResponse(
    String token,
    String tokenType,
    UserDto user
) {
    public AuthResponse(String token, UserDto user) {
        this(token, "Bearer", user);
    }
}
