package com.revisemind.auth;

import com.revisemind.auth.dto.AuthResponse;
import com.revisemind.auth.dto.LoginRequest;
import com.revisemind.auth.dto.RegisterRequest;
import com.revisemind.auth.security.JwtTokenProvider;
import com.revisemind.common.exception.BadRequestException;
import com.revisemind.user.User;
import com.revisemind.user.UserRepository;
import com.revisemind.user.dto.UserDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtTokenProvider jwtTokenProvider
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        String timeZone = (request.timeZone() != null && !request.timeZone().isBlank())
            ? request.timeZone().trim()
            : "Asia/Kolkata";

        User user = new User(
            UUID.randomUUID(),
            request.name().trim(),
            normalizedEmail,
            passwordEncoder.encode(request.password()),
            timeZone
        );

        User savedUser = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(savedUser.getId(), savedUser.getEmail());

        return new AuthResponse(token, UserDto.fromEntity(savedUser));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new BadRequestException("Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password.");
        }

        if (!user.isEnabled()) {
            throw new BadRequestException("This account has been disabled.");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, UserDto.fromEntity(user));
    }

    public UserDto getCurrentUser(User principal) {
        if (principal == null) {
            throw new BadRequestException("Not authenticated");
        }
        return UserDto.fromEntity(principal);
    }
}
