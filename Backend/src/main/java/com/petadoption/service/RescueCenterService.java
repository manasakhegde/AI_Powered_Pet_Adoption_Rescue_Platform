package com.petadoption.service;

import com.petadoption.model.RescueCenter;
import com.petadoption.repository.RescueCenterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RescueCenterService {
    
    private final RescueCenterRepository rescueCenterRepository;
    
    // Create new rescue center
    public RescueCenter createRescueCenter(RescueCenter rescueCenter) {
        log.info("Creating rescue center: {}", rescueCenter.getName());
        rescueCenter.setCreatedAt(LocalDateTime.now());
        rescueCenter.setUpdatedAt(LocalDateTime.now());
        rescueCenter.setActive(true);
        rescueCenter.setVerificationStatus("PENDING");
        rescueCenter.setAverageRating(0.0);
        rescueCenter.setTotalReviews(0);
        rescueCenter.setAdoptionsCompleted(0);
        return rescueCenterRepository.save(rescueCenter);
    }
    
    // Get all rescue centers
    public List<RescueCenter> getAllRescueCenters() {
        log.info("Fetching all rescue centers");
        return rescueCenterRepository.findAll();
    }
    
    // Get all active rescue centers
    public List<RescueCenter> getActiveRescueCenters() {
        log.info("Fetching active rescue centers");
        return rescueCenterRepository.findByVerificationStatusAndActive("VERIFIED", true);
    }
    
    // Get rescue center by ID
    public Optional<RescueCenter> getRescueCenterById(String id) {
        log.info("Fetching rescue center: {}", id);
        return rescueCenterRepository.findById(id);
    }
    
    // Update rescue center
    public RescueCenter updateRescueCenter(String id, RescueCenter rescueCenter) {
        log.info("Updating rescue center: {}", id);
        return rescueCenterRepository.findById(id).map(existing -> {
            existing.setName(rescueCenter.getName());
            existing.setDescription(rescueCenter.getDescription());
            existing.setPhone(rescueCenter.getPhone());
            existing.setEmail(rescueCenter.getEmail());
            existing.setWebsite(rescueCenter.getWebsite());
            existing.setAddress(rescueCenter.getAddress());
            existing.setCity(rescueCenter.getCity());
            existing.setState(rescueCenter.getState());
            existing.setZipCode(rescueCenter.getZipCode());
            existing.setLatitude(rescueCenter.getLatitude());
            existing.setLongitude(rescueCenter.getLongitude());
            existing.setOpeningHours(rescueCenter.getOpeningHours());
            existing.setTotalCapacity(rescueCenter.getTotalCapacity());
            existing.setCurrentAnimals(rescueCenter.getCurrentAnimals());
            existing.setServices(rescueCenter.getServices());
            existing.setSpecializations(rescueCenter.getSpecializations());
            existing.setContactPerson(rescueCenter.getContactPerson());
            existing.setContactPersonRole(rescueCenter.getContactPersonRole());
            existing.setContactPersonPhone(rescueCenter.getContactPersonPhone());
            existing.setUpdatedAt(LocalDateTime.now());
            return rescueCenterRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Rescue center not found"));
    }
    
    // Delete rescue center
    public void deleteRescueCenter(String id) {
        log.info("Deleting rescue center: {}", id);
        rescueCenterRepository.deleteById(id);
    }
    
    // Find centers by city
    public List<RescueCenter> findByCity(String city) {
        log.info("Finding rescue centers in city: {}", city);
        return rescueCenterRepository.findByCity(city);
    }
    
    // Find centers by service
    public List<RescueCenter> findByService(String service) {
        log.info("Finding rescue centers with service: {}", service);
        return rescueCenterRepository.findByServiceContaining(service);
    }
    
    // Find centers in city with specific service
    public List<RescueCenter> findByCityAndService(String city, String service) {
        log.info("Finding rescue centers in {} with service: {}", city, service);
        return rescueCenterRepository.findByCityAndService(city, service);
    }
    
    // Find nearby centers based on coordinates
    public List<RescueCenter> findNearby(Double latitude, Double longitude, Double radiusInKm) {
        log.info("Finding rescue centers near lat: {}, lon: {}, radius: {}km", latitude, longitude, radiusInKm);
        // Approximate: 1 degree of latitude ≈ 111 km
        Double radiusDegrees = radiusInKm / 111.0;
        Double minLat = latitude - radiusDegrees;
        Double maxLat = latitude + radiusDegrees;
        Double minLon = longitude - radiusDegrees;
        Double maxLon = longitude + radiusDegrees;
        return rescueCenterRepository.findNearby(minLat, maxLat, minLon, maxLon);
    }
    
    // Search rescue centers
    public List<RescueCenter> searchRescueCenters(String searchTerm) {
        log.info("Searching rescue centers with term: {}", searchTerm);
        return rescueCenterRepository.searchByNameOrCity(searchTerm);
    }
    
    // Verify rescue center (admin action)
    public RescueCenter verifyRescueCenter(String id) {
        log.info("Verifying rescue center: {}", id);
        return rescueCenterRepository.findById(id).map(center -> {
            center.setVerificationStatus("VERIFIED");
            center.setVerified(true);
            center.setUpdatedAt(LocalDateTime.now());
            return rescueCenterRepository.save(center);
        }).orElseThrow(() -> new RuntimeException("Rescue center not found"));
    }
    
    // Reject rescue center (admin action)
    public RescueCenter rejectRescueCenter(String id) {
        log.info("Rejecting rescue center: {}", id);
        return rescueCenterRepository.findById(id).map(center -> {
            center.setVerificationStatus("REJECTED");
            center.setVerified(false);
            center.setActive(false);
            center.setUpdatedAt(LocalDateTime.now());
            return rescueCenterRepository.save(center);
        }).orElseThrow(() -> new RuntimeException("Rescue center not found"));
    }
    
    // Update animal count
    public RescueCenter updateAnimalCount(String id, Integer currentAnimals) {
        log.info("Updating animal count for center: {} to {}", id, currentAnimals);
        return rescueCenterRepository.findById(id).map(center -> {
            center.setCurrentAnimals(currentAnimals);
            center.setUpdatedAt(LocalDateTime.now());
            return rescueCenterRepository.save(center);
        }).orElseThrow(() -> new RuntimeException("Rescue center not found"));
    }
    
    // Update rating
    public RescueCenter updateRating(String id, Double newRating, Integer reviewCount) {
        log.info("Updating rating for center: {} to {}", id, newRating);
        return rescueCenterRepository.findById(id).map(center -> {
            center.setAverageRating(newRating);
            center.setTotalReviews(reviewCount);
            center.setUpdatedAt(LocalDateTime.now());
            return rescueCenterRepository.save(center);
        }).orElseThrow(() -> new RuntimeException("Rescue center not found"));
    }
}
