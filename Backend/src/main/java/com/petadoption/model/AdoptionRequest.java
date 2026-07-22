package com.petadoption.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "adoption_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdoptionRequest {

    @Id
    private String id;

    private String petId;
    private String petName;
    private String petSpecies;
    private String petBreed;
    private String petImage;

    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String customerAddress;

    private String homeType;
    private String homeOwnership;
    private String adoptionReason;
    private String experience;

    private String userId;
    private String userEmail;

    private String status;      // Pending, Approved, Rejected
    private String adoptedAt;
    private String createdAt;
    private String updatedAt;
    private String resolvedAt;
}
