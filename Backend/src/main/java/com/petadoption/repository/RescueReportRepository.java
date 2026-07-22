package com.petadoption.repository;

import com.petadoption.model.RescueReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RescueReportRepository extends MongoRepository<RescueReport, String> {
    List<RescueReport> findByUserEmail(String userEmail);
    List<RescueReport> findByStatus(String status);
}
