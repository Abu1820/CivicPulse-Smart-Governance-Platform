package com.civicpulse.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.civicpulse.backend.entity.Role;
import com.civicpulse.backend.entity.User;
import com.civicpulse.backend.repository.UserRepository;

@Slf4j
@Component
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminInitializer(UserRepository userRepository,
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        // Ensure owner/primary administrator account is always granted ADMIN rights
        userRepository.findByEmail("abdulmajeed564600@gmail.com").ifPresent(adminUser -> {
            boolean updated = false;
            if (adminUser.getRole() != Role.ADMIN) {
                adminUser.setRole(Role.ADMIN);
                updated = true;
            }
            if (!adminUser.isEmailVerified()) {
                adminUser.setEmailVerified(true);
                updated = true;
            }
            if (updated) {
                userRepository.save(adminUser);
                log.info("Primary administrator verified and promoted to ADMIN: abdulmajeed564600@gmail.com");
            }
        });

        // Seed a standard Citizen Demo account for public visitors/recruiters (non-admin)
        if (!userRepository.existsByEmail("citizen@civicpulse.com")) {
            User citizen = new User();
            citizen.setName("Citizen Demo");
            citizen.setEmail("citizen@civicpulse.com");
            citizen.setPassword(passwordEncoder.encode("citizen123"));
            citizen.setRole(Role.USER);
            citizen.setEmailVerified(true);

            userRepository.save(citizen);
            log.info("Public Citizen demo account seeded successfully: citizen@civicpulse.com");
        }
    }
}
