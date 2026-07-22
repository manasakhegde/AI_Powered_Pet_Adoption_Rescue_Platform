package com.petadoption.repository;

import com.petadoption.model.RescueCenter;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RescueCenterRepository extends MongoRepository<RescueCenter, String> {
    
    // Find by city
    List<RescueCenter> findByCity(String city);
    
    // Find all active rescue centers
    List<RescueCenter> findByActive(Boolean active);
    
    // Find verified centers
    List<RescueCenter> findByVerificationStatusAndActive(String verificationStatus, Boolean active);
    
    // Find by name (case-insensitive)
    Optional<RescueCenter> findByNameIgnoreCase(String name);
    
    // Find by email
    Optional<RescueCenter> findByEmail(String email);
    
    // Find by phone
    Optional<RescueCenter> findByPhone(String phone);
    
    // Find centers with specific service
    @Query("{ 'services': { $regex: ?0, $options: 'i' } }")
    List<RescueCenter> findByServiceContaining(String service);
    
    // Find centers in a city with specific service
    @Query("{ 'city': ?0, 'services': { $regex: ?1, $options: 'i' } }")
    List<RescueCenter> findByCityAndService(String city, String service);
    
    // Find nearby centers within a location range (using coordinates)
    @Query("{ 'latitude': { $gte: ?0, $lte: ?1 }, 'longitude': { $gte: ?2, $lte: ?3 } }")
    List<RescueCenter> findNearby(Double minLat, Double maxLat, Double minLon, Double maxLon);
    
    // Search by name or city
    @Query("{ $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'city': { $regex: ?0, $options: 'i' } } ] }")
    List<RescueCenter> searchByNameOrCity(String searchTerm);
}
