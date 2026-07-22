package com.petadoption.repository;

import com.petadoption.model.Adoption;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdoptionRepository extends MongoRepository<Adoption, String> {

    List<Adoption> findByApplicationStatus(String status);

    List<Adoption> findByAdopterId(String adopterId);

    List<Adoption> findByPetId(String petId);

    List<Adoption> findByRescueCenterId(String rescueCenterId);

    Optional<Adoption> findByPetIdAndApplicationStatus(String petId, String status);

    List<Adoption> findByAdopterIdAndApplicationStatus(String adopterId, String status);

    List<Adoption> findByPaymentStatus(String paymentStatus);

}
