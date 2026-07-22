package com.petadoption.service;

import com.petadoption.model.Pet;
import com.petadoption.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PetService {

    private final PetRepository petRepository;

    public Pet createPet(Pet pet) {
        pet.setRegistrationDate(LocalDateTime.now());
        pet.setLastUpdated(LocalDateTime.now());
        pet.setViewCount(0);
        pet.setAdoptionStatus("Available");
        log.info("Creating new pet: {}", pet.getName());
        return petRepository.save(pet);
    }

    public Optional<Pet> getPetById(String id) {
        return petRepository.findById(id);
    }

    public List<Pet> getAllPets() {
        return petRepository.findAll();
    }

    public List<Pet> getAvailablePets() {
        return petRepository.findAllAvailablePets();
    }

    public List<Pet> getPetsBySpecies(String species) {
        return petRepository.findAvailablePetsBySpecies(species);
    }

    public List<Pet> getPetsByLocation(String location) {
        return petRepository.findByLocation(location);
    }

    public List<Pet> getPetsByRescueCenter(String rescueCenter) {
        return petRepository.findByRescueCenter(rescueCenter);
    }

    public Pet updatePet(String id, Pet petDetails) {
        Optional<Pet> pet = petRepository.findById(id);
        if (pet.isPresent()) {
            Pet existingPet = pet.get();
            existingPet.setName(petDetails.getName());
            existingPet.setSpecies(petDetails.getSpecies());
            existingPet.setBreed(petDetails.getBreed());
            existingPet.setAge(petDetails.getAge());
            existingPet.setGender(petDetails.getGender());
            existingPet.setSize(petDetails.getSize());
            existingPet.setColor(petDetails.getColor());
            existingPet.setDescription(petDetails.getDescription());
            existingPet.setImageUrls(petDetails.getImageUrls());
            existingPet.setHealthStatus(petDetails.getHealthStatus());
            existingPet.setVaccinated(petDetails.getVaccinated());
            existingPet.setNeutered(petDetails.getNeutered());
            existingPet.setAdoptionStatus(petDetails.getAdoptionStatus());
            existingPet.setLastUpdated(LocalDateTime.now());
            log.info("Updating pet: {}", id);
            return petRepository.save(existingPet);
        }
        return null;
    }

    public void deletePet(String id) {
        log.info("Deleting pet: {}", id);
        petRepository.deleteById(id);
    }

    public Pet incrementViewCount(String id) {
        Optional<Pet> pet = petRepository.findById(id);
        if (pet.isPresent()) {
            Pet existingPet = pet.get();
            existingPet.setViewCount((existingPet.getViewCount() != null ? existingPet.getViewCount() : 0) + 1);
            return petRepository.save(existingPet);
        }
        return null;
    }

    public void updatePetAdoptionStatus(String petId, String status) {
        Optional<Pet> pet = petRepository.findById(petId);
        if (pet.isPresent()) {
            Pet existingPet = pet.get();
            existingPet.setAdoptionStatus(status);
            existingPet.setLastUpdated(LocalDateTime.now());
            petRepository.save(existingPet);
            log.info("Updated pet {} adoption status to: {}", petId, status);
        }
    }

}
