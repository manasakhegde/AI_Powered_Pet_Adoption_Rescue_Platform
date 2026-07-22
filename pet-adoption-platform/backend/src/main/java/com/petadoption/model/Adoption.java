package com.petadoption.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "adoptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Adoption {

    @Id
    private String id;

    private String petId;
    private String adopterId;
    private String rescueCenterId;
    
    private String applicationStatus;  // SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, COMPLETED
    
    private LocalDateTime applicationDate;
    private LocalDateTime approvalDate;
    private LocalDateTime completionDate;
    private LocalDateTime lastUpdated;
    
    private String adoptionReason;
    private String livingConditions;
    private Boolean veterinarianReference;
    private String referenceDetails;
    
    private Double adoptionFeeAmount;
    private String paymentStatus;  // PENDING, COMPLETED, REFUNDED
    private String transactionId;
    
    private String reasonForRejection;
    private String reviewerNotes;
    private String reviewerId;
    
    private String contractSigned;  // YES, NO, PENDING
    private LocalDateTime contractSignDate;
    
    private String postAdoptionFollowUp;  // PENDING, COMPLETED, NOT_REQUIRED
    private LocalDateTime followUpDate;
}
