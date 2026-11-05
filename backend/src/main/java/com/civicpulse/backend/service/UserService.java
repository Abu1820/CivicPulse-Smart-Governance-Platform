package com.civicpulse.backend.service;

import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.civicpulse.backend.dto.AuthResponse;
import com.civicpulse.backend.dto.LoginRequest;
import com.civicpulse.backend.dto.RegisterRequest;
import com.civicpulse.backend.entity.Role;
import com.civicpulse.backend.entity.User;
import com.civicpulse.backend.jwt.JwtService;
import com.civicpulse.backend.repository.UserRepository;

@Slf4j
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration attempt with existing email: {}", request.getEmail());
            return new AuthResponse("Email already exists", false);
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // Encrypt Password
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Default Role
        user.setRole(Role.USER);

        userRepository.save(user);
        log.info("New user registered successfully: {}", request.getEmail());

        return new AuthResponse("Registration Successful", true);
    }

    public AuthResponse login(LoginRequest request) {

        log.debug("Login attempt for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            log.warn("Login failed: User not found with email {}", request.getEmail());
            return new AuthResponse("User not found", false);
        }

        boolean passwordMatch =
                passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!passwordMatch) {
            log.warn("Login failed: Invalid password for email {}", request.getEmail());
            return new AuthResponse("Invalid password", false);
        }

        String token = jwtService.generateToken(user.getEmail());
        log.info("User authenticated successfully: {}", user.getEmail());

        return new AuthResponse(
                "Login Successful",
                true,
                user.getName(),
                user.getEmail(),
                user.getRole(),
                token
        );
    }
}
