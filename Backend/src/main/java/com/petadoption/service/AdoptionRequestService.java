package com.petadoption.service;

import com.petadoption.model.AdoptionRequest;
import com.petadoption.repository.AdoptionRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdoptionRequestService {

    private final AdoptionRequestRepository adoptionRequestRepository;

    public AdoptionRequest createRequest(AdoptionRequest request) {
        if (request.getStatus() == null) {
            request.setStatus("Pending");
        }
        request.setCreatedAt(LocalDateTime.now().toString());
        request.setUpdatedAt(LocalDateTime.now().toString());
        log.info("Saving adoption request for pet {} by {}", request.getPetId(), request.getCustomerEmail());
        return adoptionRequestRepository.save(request);
    }

    public List<AdoptionRequest> getAllRequests() {
        return adoptionRequestRepository.findAll();
    }

    public List<AdoptionRequest> getRequestsByUserEmail(String userEmail) {
        return adoptionRequestRepository.findByUserEmail(userEmail);
    }

    public Optional<AdoptionRequest> getRequestById(String id) {
        return adoptionRequestRepository.findById(id);
    }

    public AdoptionRequest updateRequestStatus(String id, String status) {
        return adoptionRequestRepository.findById(id).map(request -> {
            request.setStatus(status);
            request.setResolvedAt(LocalDateTime.now().toString());
            request.setUpdatedAt(LocalDateTime.now().toString());
            return adoptionRequestRepository.save(request);
        }).orElseThrow(() -> new IllegalStateException("Adoption request not found"));
    }
}
