package com.civicpulse.backend.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.civicpulse.backend.dto.AuthResponse;
import com.civicpulse.backend.dto.LoginRequest;
import com.civicpulse.backend.dto.RegisterRequest;
import com.civicpulse.backend.dto.ResendCodeRequest;
import com.civicpulse.backend.dto.VerifyEmailRequest;
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
    private final EmailNotificationService emailNotificationService;
    private final SecureRandom secureRandom = new SecureRandom();

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       EmailNotificationService emailNotificationService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailNotificationService = emailNotificationService;
    }

    private String generateOtpCode() {
        return String.format("%06d", secureRandom.nextInt(1_000_000));
    }

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration attempt with existing email: {}", request.getEmail());
            return new AuthResponse("Email already exists", false);
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);

        // Setup verification code
        String otp = generateOtpCode();
        user.setEmailVerified(false);
        user.setVerificationCode(otp);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(15));

        userRepository.save(user);
        log.info("New user registered pending verification: {}", user.getEmail());

        // Dispatch verification email
        emailNotificationService.sendVerificationEmail(user.getEmail(), user.getName(), otp);

        AuthResponse response = new AuthResponse("Verification code sent to your email", true);
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setRequiresVerification(true);
        if (!emailNotificationService.isMailEnabled()) {
            response.setDevVerificationCode(otp);
        }

        return response;
    }

    public AuthResponse verifyEmail(VerifyEmailRequest request) {

        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return new AuthResponse("User not found with email: " + email, false);
        }

        if (user.isEmailVerified()) {
            String token = jwtService.generateToken(user.getEmail());
            AuthResponse res = new AuthResponse("Email is already verified", true, user.getName(), user.getEmail(), user.getRole(), token);
            res.setEmailVerified(true);
            return res;
        }

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(request.getCode().trim())) {
            return new AuthResponse("Invalid verification code. Please check and try again.", false);
        }

        if (user.getVerificationCodeExpiry() == null || LocalDateTime.now().isAfter(user.getVerificationCodeExpiry())) {
            return new AuthResponse("Verification code has expired. Please request a new code.", false);
        }

        // Successfully verified
        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);
        userRepository.save(user);

        log.info("Email verified successfully for user: {}", user.getEmail());

        String token = jwtService.generateToken(user.getEmail());
        AuthResponse res = new AuthResponse(
                "Email verified successfully! Welcome to CivicPulse.",
                true,
                user.getName(),
                user.getEmail(),
                user.getRole(),
                token
        );
        res.setEmailVerified(true);
        return res;
    }

    public AuthResponse resendVerificationCode(ResendCodeRequest request) {

        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return new AuthResponse("No account found with email: " + email, false);
        }

        if (user.isEmailVerified()) {
            return new AuthResponse("Email is already verified. You can log in.", true);
        }

        String newOtp = generateOtpCode();
        user.setVerificationCode(newOtp);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        log.info("Resending verification code to: {}", user.getEmail());
        emailNotificationService.sendVerificationEmail(user.getEmail(), user.getName(), newOtp);

        AuthResponse res = new AuthResponse("A fresh verification code has been sent.", true);
        res.setEmail(user.getEmail());
        res.setRequiresVerification(true);
        if (!emailNotificationService.isMailEnabled()) {
            res.setDevVerificationCode(newOtp);
        }
        return res;
    }

    public AuthResponse login(LoginRequest request) {

        String email = request.getEmail().toLowerCase().trim();
        log.debug("Login attempt for email: {}", email);

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            log.warn("Login failed: User not found with email {}", email);
            return new AuthResponse("User not found", false);
        }

        boolean passwordMatch =
                passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!passwordMatch) {
            log.warn("Login failed: Invalid password for email {}", email);
            return new AuthResponse("Invalid password", false);
        }

        // Enforce email verification check
        if (!user.isEmailVerified()) {
            log.warn("Login blocked: Unverified email for {}", email);
            AuthResponse unverifiedRes = new AuthResponse("Please verify your email address before logging in.", false);
            unverifiedRes.setEmail(user.getEmail());
            unverifiedRes.setRequiresVerification(true);
            return unverifiedRes;
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
