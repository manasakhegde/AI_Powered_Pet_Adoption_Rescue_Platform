package com.petadoption.controller;

import com.petadoption.model.Pet;
import com.petadoption.service.PetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

}
