package com.petadoption.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    
    private String role;  // USER, ADMIN, RESCUE_CENTER
    private String userType;  // ADOPTER, RESCUE_STAFF, VETERINARIAN
    
    private Boolean emailVerified;
    private Boolean active;
    
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private LocalDateTime updatedAt;
    
    private String profileImageUrl;
    private String bio;
    
    // Adopter specific
    private Integer householdSize;
    private Boolean ownRent;  // true = own, false = rent
    private List<String> petOwnershipHistory;
    
    // Rescue center specific
    private String organizationName;
    private String organizationRegistration;
    private String licenseNumber;
    
    private String status;  // ACTIVE, INACTIVE, SUSPENDED
}
