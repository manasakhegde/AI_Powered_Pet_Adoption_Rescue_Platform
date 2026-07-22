package com.petadoption.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "rescue_centers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueCenter {
    @Id
    private String id;
    
    private String name;
    private String description;
    private String phone;
    private String email;
    private String website;
    
    // Location
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private Double latitude;
    private Double longitude;
    
    // Operational info
    private String openingHours; // e.g., "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
    private Integer totalCapacity; // Number of animals they can house
    private Integer currentAnimals; // Current number of animals
    private String services; // e.g., "Shelter, Medical Care, Adoption, Training"
    private String specializations; // e.g., "Dogs, Cats, Exotic Animals"
    
    // Contact person
    private String contactPerson;
    private String contactPersonRole;
    private String contactPersonPhone;
    
    // Status and verification
    private Boolean verified;
    private Boolean active;
    private String verificationStatus; // PENDING, VERIFIED, REJECTED
    private String registrationType; // GOVERNMENT, NGO, PRIVATE
    
    // Social & Rating
    private Double averageRating;
    private Integer totalReviews;
    private Integer adoptionsCompleted;
    private String socialMediaLinks; // JSON format: {facebook, instagram, twitter}
    
    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
