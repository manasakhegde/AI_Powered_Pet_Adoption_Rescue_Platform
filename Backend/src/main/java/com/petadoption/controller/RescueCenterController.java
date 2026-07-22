package com.petadoption.controller;

import com.petadoption.model.RescueCenter;
import com.petadoption.service.RescueCenterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/rescue-centers")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class RescueCenterController {
    
    private final RescueCenterService rescueCenterService;
    
    // ==================== PUBLIC ENDPOINTS ====================
    
    // Get all active rescue centers (public)
    @GetMapping
    public ResponseEntity<List<RescueCenter>> getActiveRescueCenters() {
        log.info("GET /rescue-centers - Fetching active rescue centers");
        List<RescueCenter> centers = rescueCenterService.getActiveRescueCenters();
        return ResponseEntity.ok(centers);
    }
    
    // Get rescue center by ID (public)
    @GetMapping("/{id}")
    public ResponseEntity<?> getRescueCenterById(@PathVariable String id) {
        log.info("GET /rescue-centers/{} - Fetching rescue center by ID", id);
        return rescueCenterService.getRescueCenterById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, String>() {{
                            put("message", "Rescue center not found");
                        }}));
    }
    
    // Search rescue centers by city
    @GetMapping("/search/city")
    public ResponseEntity<List<RescueCenter>> searchByCity(@RequestParam String city) {
        log.info("GET /rescue-centers/search/city?city={} - Searching by city", city);
        List<RescueCenter> centers = rescueCenterService.findByCity(city);
        return ResponseEntity.ok(centers);
    }
    
    // Search rescue centers by service
    @GetMapping("/search/service")
    public ResponseEntity<List<RescueCenter>> searchByService(@RequestParam String service) {
        log.info("GET /rescue-centers/search/service?service={} - Searching by service", service);
        List<RescueCenter> centers = rescueCenterService.findByService(service);
        return ResponseEntity.ok(centers);
    }
    
    // Search rescue centers by city and service
    @GetMapping("/search/city-service")
    public ResponseEntity<List<RescueCenter>> searchByCityAndService(
            @RequestParam String city,
            @RequestParam String service) {
        log.info("GET /rescue-centers/search/city-service?city={}&service={}", city, service);
        List<RescueCenter> centers = rescueCenterService.findByCityAndService(city, service);
        return ResponseEntity.ok(centers);
    }
    
    // Find nearby rescue centers
    @GetMapping("/search/nearby")
    public ResponseEntity<List<RescueCenter>> findNearby(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10") Double radiusInKm) {
        log.info("GET /rescue-centers/search/nearby?lat={}&lon={}&radius={}", latitude, longitude, radiusInKm);
        List<RescueCenter> centers = rescueCenterService.findNearby(latitude, longitude, radiusInKm);
        return ResponseEntity.ok(centers);
    }
    
    // Search rescue centers by term
    @GetMapping("/search")
    public ResponseEntity<List<RescueCenter>> searchRescueCenters(@RequestParam String term) {
        log.info("GET /rescue-centers/search?term={} - Searching rescue centers", term);
        List<RescueCenter> centers = rescueCenterService.searchRescueCenters(term);
        return ResponseEntity.ok(centers);
    }
    
    // ==================== ADMIN ENDPOINTS ====================
    
    // Create new rescue center (admin)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RescueCenter> createRescueCenter(@RequestBody RescueCenter rescueCenter) {
        log.info("POST /rescue-centers - Creating new rescue center: {}", rescueCenter.getName());
        RescueCenter created = rescueCenterService.createRescueCenter(rescueCenter);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    // Get all rescue centers including unverified (admin only)
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RescueCenter>> getAllRescueCenters() {
        log.info("GET /rescue-centers/admin/all - Fetching all rescue centers");
        List<RescueCenter> centers = rescueCenterService.getAllRescueCenters();
        return ResponseEntity.ok(centers);
    }
    
    // Update rescue center (admin)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRescueCenter(
            @PathVariable String id,
            @RequestBody RescueCenter rescueCenter) {
        log.info("PUT /rescue-centers/{} - Updating rescue center", id);
        try {
            RescueCenter updated = rescueCenterService.updateRescueCenter(id, rescueCenter);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new HashMap<String, String>() {{
                        put("message", e.getMessage());
                    }});
        }
    }
    
    // Delete rescue center (admin)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteRescueCenter(@PathVariable String id) {
        log.info("DELETE /rescue-centers/{} - Deleting rescue center", id);
        try {
            rescueCenterService.deleteRescueCenter(id);
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("message", "Rescue center deleted successfully");
            }});
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new HashMap<String, String>() {{
                        put("message", e.getMessage());
                    }});
        }
    }
    
    // Verify rescue center (admin)
    @PostMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> verifyRescueCenter(@PathVariable String id) {
        log.info("POST /rescue-centers/{}/verify - Verifying rescue center", id);
        try {
            RescueCenter verified = rescueCenterService.verifyRescueCenter(id);
            return ResponseEntity.ok(verified);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new HashMap<String, String>() {{
                        put("message", e.getMessage());
                    }});
        }
    }
    
    // Reject rescue center (admin)
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectRescueCenter(@PathVariable String id) {
        log.info("POST /rescue-centers/{}/reject - Rejecting rescue center", id);
        try {
            RescueCenter rejected = rescueCenterService.rejectRescueCenter(id);
            return ResponseEntity.ok(rejected);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new HashMap<String, String>() {{
                        put("message", e.getMessage());
                    }});
        }
    }
    
    // Update animal count (admin)
    @PatchMapping("/{id}/animal-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateAnimalCount(
            @PathVariable String id,
            @RequestBody Map<String, Integer> body) {
        log.info("PATCH /rescue-centers/{}/animal-count - Updating animal count", id);
        try {
            Integer count = body.get("currentAnimals");
            RescueCenter updated = rescueCenterService.updateAnimalCount(id, count);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new HashMap<String, String>() {{
                        put("message", e.getMessage());
                    }});
        }
    }
    
    // Update rating (admin)
    @PatchMapping("/{id}/rating")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRating(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        log.info("PATCH /rescue-centers/{}/rating - Updating rating", id);
        try {
            Double rating = ((Number) body.get("averageRating")).doubleValue();
            Integer reviewCount = ((Number) body.get("totalReviews")).intValue();
            RescueCenter updated = rescueCenterService.updateRating(id, rating, reviewCount);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new HashMap<String, String>() {{
                        put("message", e.getMessage());
                    }});
        }
    }
}
