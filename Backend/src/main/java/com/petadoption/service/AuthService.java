package com.petadoption.service;

import com.petadoption.dto.AuthResponse;
import com.petadoption.dto.LoginRequest;
import com.petadoption.dto.RegisterRequest;
import com.petadoption.model.Admin;
import com.petadoption.model.Customer;
import com.petadoption.repository.AdminRepository;
import com.petadoption.repository.CustomerRepository;
import com.petadoption.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final CustomerRepository customerRepository;
    private final AdminRepository    adminRepository;
    private final PasswordEncoder    passwordEncoder;
    private final JwtUtil            jwtUtil;

    // ── Customer Register → saved in 'customers' collection ──────────────────
    public AuthResponse register(RegisterRequest req) {
        if (customerRepository.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        Customer customer = Customer.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .city(req.getCity())
                .role("CUSTOMER")
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Customer saved = customerRepository.save(customer);
        log.info("New customer registered in 'customers' collection: {}", saved.getEmail());

        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole());
        return buildCustomerResponse(saved, token, "Registration successful");
    }

    // ── Customer Login → validates against 'customers' collection ────────────
    public AuthResponse login(LoginRequest req) {
        Customer customer = customerRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), customer.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        if (!customer.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is disabled");
        }

        // Update last login timestamp
        customer.setLastLoginAt(LocalDateTime.now());
        customerRepository.save(customer);

        log.info("Customer logged in: {}", customer.getEmail());
        String token = jwtUtil.generateToken(customer.getEmail(), customer.getRole());
        return buildCustomerResponse(customer, token, "Login successful");
    }

    // ── Admin Login → validates against 'admins' collection ──────────────────
    public AuthResponse adminLogin(LoginRequest req) {
        Admin admin = adminRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid admin credentials"));

        if (!passwordEncoder.matches(req.getPassword(), admin.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin credentials");
        }
        if (!admin.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin account is disabled");
        }

        // Update last login timestamp
        admin.setLastLoginAt(LocalDateTime.now());
        adminRepository.save(admin);

        log.info("Admin logged in: {}", admin.getEmail());
        String token = jwtUtil.generateToken(admin.getEmail(), admin.getRole());
        return buildAdminResponse(admin, token, "Admin login successful");
    }

    // ── Response builders ────────────────────────────────────────────────────
    private AuthResponse buildCustomerResponse(Customer c, String token, String message) {
        return AuthResponse.builder()
                .token(token)
                .id(c.getId())
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .email(c.getEmail())
                .role(c.getRole())
                .message(message)
                .build();
    }

    private AuthResponse buildAdminResponse(Admin a, String token, String message) {
        return AuthResponse.builder()
                .token(token)
                .id(a.getId())
                .firstName(a.getFirstName())
                .lastName(a.getLastName())
                .email(a.getEmail())
                .role(a.getRole())
                .message(message)
                .build();
    }
}
