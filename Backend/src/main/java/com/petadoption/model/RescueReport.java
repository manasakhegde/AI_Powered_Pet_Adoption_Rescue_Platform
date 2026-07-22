package com.petadoption.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "rescue_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueReport {

    @Id
    private String id;

    private String userEmail;
    private String reporterName;
    private String reporterPhone;
    private String animalType;
    private String description;
    private String location;
    private String address;
    private String urgency;
    private String imagePreview;
    private List<String> aiActions;
    private String aiSeverity;
    private Integer aiConfidence;
    private String rescueCenterId;
    private String rescueCenterName;

    private String status;   // Submitted, Acknowledged, In Progress, Rescued, Closed
    private String submittedAt;
    private String updatedAt;
    private List<RescueTimelineEvent> timeline;
}
