package com.petadoption.config;

import com.petadoption.model.Admin;
import com.petadoption.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Seeds the default admin account into the 'admins' collection on startup.
 * Customers register themselves — no seeding needed for them.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository   adminRepository;
    private final PasswordEncoder   passwordEncoder;

    @Override
    public void run(String... args) {
        seedDefaultAdmin();
    }

    private void seedDefaultAdmin() {
        String adminEmail = "admin@gmail.com";

        if (!adminRepository.existsByEmail(adminEmail)) {
            Admin admin = Admin.builder()
                    .firstName("Admin")
                    .lastName("User")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("Admin@123"))
                    .role("ADMIN")
                    .enabled(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            adminRepository.save(admin);
            log.info("✅ Default admin seeded into 'admins' collection: {}", adminEmail);
        } else {
            log.info("✅ Admin already exists in 'admins' collection: {}", adminEmail);
        }
    }
}
