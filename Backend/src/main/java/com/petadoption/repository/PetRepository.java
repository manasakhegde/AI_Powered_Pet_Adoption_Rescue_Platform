package com.petadoption.repository;

import com.petadoption.model.Pet;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PetRepository extends MongoRepository<Pet, String> {

    List<Pet> findByAdoptionStatus(String status);
    List<Pet> findBySpecies(String species);
    List<Pet> findByLocation(String location);
    List<Pet> findByRescueCenter(String rescueCenter);
    
    @Query("{ 'adoptionStatus': 'Available' }")
    List<Pet> findAvailablePets();
    
    Optional<Pet> findByMicrochipId(String microchipId);
}
