package com.petadoption.repository;

import com.petadoption.model.AdoptionRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdoptionRequestRepository extends MongoRepository<AdoptionRequest, String> {
    List<AdoptionRequest> findByUserEmail(String userEmail);
    List<AdoptionRequest> findByPetId(String petId);
}
