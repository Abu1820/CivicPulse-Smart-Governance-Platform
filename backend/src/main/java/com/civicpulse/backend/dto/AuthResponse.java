package com.civicpulse.backend.dto;

import com.civicpulse.backend.entity.Role;

public class AuthResponse {

    private String message;
    private boolean success;

    private String name;
    private String email;
    private Role role;
    private String token;

    private boolean emailVerified = true;
    private boolean requiresVerification = false;
    private String devVerificationCode;

    public AuthResponse() {
    }

    // Register / simple Response
    public AuthResponse(String message, boolean success) {
        this.message = message;
        this.success = success;
    }

    // Login Response
    public AuthResponse(String message,
                        boolean success,
                        String name,
                        String email,
                        Role role,
                        String token) {

        this.message = message;
        this.success = success;
        this.name = name;
        this.email = email;
        this.role = role;
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public String getToken() {
        return token;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public boolean isRequiresVerification() {
        return requiresVerification;
    }

    public void setRequiresVerification(boolean requiresVerification) {
        this.requiresVerification = requiresVerification;
    }

    public String getDevVerificationCode() {
        return devVerificationCode;
    }

    public void setDevVerificationCode(String devVerificationCode) {
        this.devVerificationCode = devVerificationCode;
    }
}
