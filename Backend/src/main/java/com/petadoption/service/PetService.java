package com.petadoption.service;

import com.petadoption.model.Pet;
import com.petadoption.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PetService {

    private final PetRepository petRepository;

    public List<Pet> getAllPets() {
        return petRepository.findAll();
    }

    public List<Pet> getAvailablePets() {
        return petRepository.findAvailablePets();
    }

    public Optional<Pet> getPetById(String id) {
        return petRepository.findById(id);
    }

    public List<Pet> getPetsBySpecies(String species) {
        return petRepository.findBySpecies(species);
    }

    public List<Pet> getPetsByLocation(String location) {
        return petRepository.findByLocation(location);
    }

    public List<Pet> getPetsByRescueCenter(String rescueCenter) {
        return petRepository.findByRescueCenter(rescueCenter);
    }

    public Pet createPet(Pet pet) {
        pet.setRegistrationDate(LocalDateTime.now());
        pet.setLastUpdated(LocalDateTime.now());
        pet.setViewCount(0);
        if (pet.getAdoptionStatus() == null) {
            pet.setAdoptionStatus("Available");
        }
        return petRepository.save(pet);
    }

    public Pet updatePet(String id, Pet petDetails) {
        Optional<Pet> existingPet = petRepository.findById(id);
        if (existingPet.isPresent()) {
            Pet pet = existingPet.get();
            if (petDetails.getName() != null)           pet.setName(petDetails.getName());
            if (petDetails.getSpecies() != null)        pet.setSpecies(petDetails.getSpecies());
            if (petDetails.getBreed() != null)          pet.setBreed(petDetails.getBreed());
            if (petDetails.getAge() != null)            pet.setAge(petDetails.getAge());
            if (petDetails.getAgeUnit() != null)        pet.setAgeUnit(petDetails.getAgeUnit());
            if (petDetails.getDescription() != null)    pet.setDescription(petDetails.getDescription());
            if (petDetails.getLocation() != null)       pet.setLocation(petDetails.getLocation());
            if (petDetails.getAdoptionFee() != null)    pet.setAdoptionFee(petDetails.getAdoptionFee());
            if (petDetails.getAdoptionStatus() != null) pet.setAdoptionStatus(petDetails.getAdoptionStatus());
            if (petDetails.getHealthStatus() != null)   pet.setHealthStatus(petDetails.getHealthStatus());
            if (petDetails.getVaccinated() != null)     pet.setVaccinated(petDetails.getVaccinated());
            if (petDetails.getImageUrls() != null)      pet.setImageUrls(petDetails.getImageUrls());
            if (petDetails.getOwnerName() != null)      pet.setOwnerName(petDetails.getOwnerName());
            if (petDetails.getOwnerPhone() != null)     pet.setOwnerPhone(petDetails.getOwnerPhone());
            if (petDetails.getOwnerEmail() != null)     pet.setOwnerEmail(petDetails.getOwnerEmail());
            if (petDetails.getOwnerAddress() != null)   pet.setOwnerAddress(petDetails.getOwnerAddress());
            pet.setLastUpdated(LocalDateTime.now());
            return petRepository.save(pet);
        }
        return null;
    }

    public void deletePet(String id) {
        petRepository.deleteById(id);
    }

    public void updatePetAdoptionStatus(String id, String status) {
        Optional<Pet> existingPet = petRepository.findById(id);
        if (existingPet.isPresent()) {
            Pet pet = existingPet.get();
            pet.setAdoptionStatus(status);
            pet.setLastUpdated(LocalDateTime.now());
            petRepository.save(pet);
        }
    }

    public void incrementViewCount(String id) {
        Optional<Pet> existingPet = petRepository.findById(id);
        if (existingPet.isPresent()) {
            Pet pet = existingPet.get();
            pet.setViewCount(pet.getViewCount() != null ? pet.getViewCount() + 1 : 1);
            petRepository.save(pet);
        }
    }

    /**
     * Store a base64 data URL as the pet's primary image in MongoDB.
     * Replaces any existing image at index 0.
     */
    public Pet updatePetImage(String id, String base64DataUrl) {
        Optional<Pet> existing = petRepository.findById(id);
        if (existing.isEmpty()) return null;

        Pet pet = existing.get();
        List<String> urls = pet.getImageUrls() != null
                ? new java.util.ArrayList<>(pet.getImageUrls())
                : new java.util.ArrayList<>();

        if (urls.isEmpty()) {
            urls.add(base64DataUrl);
        } else {
            urls.set(0, base64DataUrl);   // replace primary image
        }
        pet.setImageUrls(urls);
        pet.setLastUpdated(LocalDateTime.now());
        return petRepository.save(pet);
    }
