package com.petadoption.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "pets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pet {

    @Id
    private String id;

    private String name;
    private String species;  // Dog, Cat, Bird, etc.
    private String breed;
    private Integer age;
    private String gender;  // Male, Female
    private String size;    // Small, Medium, Large
    private String color;
    private String description;
    private List<String> imageUrls;
    
    private String healthStatus;  // Available, Medical Treatment, etc.
    private Boolean vaccinated;
    private Boolean neutered;
    private String microchipId;
    
    private String adoptionStatus;  // Available, Adopted, On Hold
    private LocalDateTime registrationDate;
    private LocalDateTime lastUpdated;
    
    private String rescueCenter;
    private String location;
    private Double adoptionFee;
    
    private String notes;
    private Integer viewCount;
}
