package com.petadoption.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Customer accounts — stored in the 'customers' collection in MongoDB.
 * Completely separate from admins.
 */
@Document(collection = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    private String id;

    private String firstName;
    private String lastName;

    @Indexed(unique = true)
    private String email;

    private String password;   // BCrypt hashed

    private String phone;
    private String city;
    private String address;

    private String role;       // Always "CUSTOMER"
    private boolean enabled;

    private List<String> favoritesPetIds;   // pet IDs saved as favorites
    private List<String> adoptedPetIds;     // pet IDs successfully adopted

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;
}
