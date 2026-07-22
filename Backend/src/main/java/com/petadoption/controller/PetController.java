package com.petadoption.controller;

import com.petadoption.model.Pet;
import com.petadoption.service.PetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/pets")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class PetController {

    private final PetService petService;

    @GetMapping
    public ResponseEntity<List<Pet>> getAllPets() {
        log.info("Fetching all pets");
        List<Pet> pets = petService.getAllPets();
        return ResponseEntity.ok(pets);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Pet>> getAvailablePets() {
        log.info("Fetching available pets");
        List<Pet> pets = petService.getAvailablePets();
        return ResponseEntity.ok(pets);
    }

    @GetMapping("/species/{species}")
    public ResponseEntity<List<Pet>> getPetsBySpecies(@PathVariable String species) {
        log.info("Fetching pets by species: {}", species);
        List<Pet> pets = petService.getPetsBySpecies(species);
        return ResponseEntity.ok(pets);
    }

    @GetMapping("/location/{location}")
    public ResponseEntity<List<Pet>> getPetsByLocation(@PathVariable String location) {
        log.info("Fetching pets by location: {}", location);
        List<Pet> pets = petService.getPetsByLocation(location);
        return ResponseEntity.ok(pets);
    }

    @GetMapping("/rescue-center/{rescueCenterId}")
    public ResponseEntity<List<Pet>> getPetsByRescueCenter(@PathVariable String rescueCenterId) {
        log.info("Fetching pets by rescue center: {}", rescueCenterId);
        List<Pet> pets = petService.getPetsByRescueCenter(rescueCenterId);
        return ResponseEntity.ok(pets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pet> getPetById(@PathVariable String id) {
        log.info("Fetching pet: {}", id);
        Optional<Pet> pet = petService.getPetById(id);
        petService.incrementViewCount(id);
        return pet.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Pet> createPet(@RequestBody Pet pet) {
        log.info("Creating new pet: {}", pet.getName());
        Pet createdPet = petService.createPet(pet);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPet);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pet> updatePet(@PathVariable String id, @RequestBody Pet petDetails) {
        log.info("Updating pet: {}", id);
        Pet updatedPet = petService.updatePet(id, petDetails);
        if (updatedPet != null) {
            return ResponseEntity.ok(updatedPet);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePet(@PathVariable String id) {
        log.info("Deleting pet: {}", id);
        petService.deletePet(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updatePetStatus(@PathVariable String id, @RequestParam String status) {
        log.info("Updating pet status: {} -> {}", id, status);
        petService.updatePetAdoptionStatus(id, status);
        return ResponseEntity.ok().build();
    }

    /**
     * Upload an image for an existing pet.
     * Accepts multipart/form-data, converts to base64 data URL, stores in pet.imageUrls[0].
     * POST /api/pets/{id}/image
     */
    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadPetImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {
        log.info("Uploading image for pet: {}", id);

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }
        if (!file.getContentType().startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }
        // 5 MB limit
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "Image must be smaller than 5 MB"));
        }

        try {
            byte[] bytes = file.getBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);
            String dataUrl = "data:" + file.getContentType() + ";base64," + base64;

            Pet updated = petService.updatePetImage(id, dataUrl);
            if (updated == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(Map.of(
                "imageUrl", dataUrl,
                "petId", id,
                "message", "Image saved to MongoDB"
            ));
        } catch (IOException e) {
            log.error("Failed to read uploaded file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process image"));
        }
    }

    /**
     * Upload image as base64 JSON payload (alternative to multipart).
     * Useful when the frontend already has a base64 data URL.
     * POST /api/pets/{id}/image-base64
     * Body: { "imageData": "data:image/jpeg;base64,..." }
     */
    @PostMapping("/{id}/image-base64")
    public ResponseEntity<?> uploadPetImageBase64(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        log.info("Saving base64 image for pet: {}", id);

        String imageData = body.get("imageData");
        if (imageData == null || imageData.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "imageData is required"));
        }
        if (!imageData.startsWith("data:image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "imageData must be a valid data URL"));
        }
        // Rough size check — base64 is ~1.37x raw size; 5 MB raw ≈ 6.85 MB base64
        if (imageData.length() > 7 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "Image must be smaller than 5 MB"));
        }

        Pet updated = petService.updatePetImage(id, imageData);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of(
            "imageUrl", imageData,
            "petId", id,
            "message", "Image saved to MongoDB"
        ));
    }
}
