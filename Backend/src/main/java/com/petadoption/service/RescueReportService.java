package com.petadoption.service;

import com.petadoption.model.RescueReport;
import com.petadoption.repository.RescueReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RescueReportService {

    private final RescueReportRepository rescueReportRepository;

    public RescueReport createReport(RescueReport report) {
        report.setStatus(report.getStatus() == null ? "Submitted" : report.getStatus());
        report.setSubmittedAt(LocalDateTime.now().toString());
        report.setUpdatedAt(LocalDateTime.now().toString());
        log.info("Saving rescue report from {}", report.getReporterName());
        return rescueReportRepository.save(report);
    }

    public List<RescueReport> getAllReports() {
        return rescueReportRepository.findAll();
    }

    public List<RescueReport> getReportsByUserEmail(String userEmail) {
        return rescueReportRepository.findByUserEmail(userEmail);
    }

    public Optional<RescueReport> getReportById(String id) {
        return rescueReportRepository.findById(id);
    }

    public RescueReport updateReportStatus(String id, String status) {
        return rescueReportRepository.findById(id).map(report -> {
            report.setStatus(status);
            report.setUpdatedAt(LocalDateTime.now().toString());
            return rescueReportRepository.save(report);
        }).orElseThrow(() -> new IllegalStateException("Rescue report not found"));
    }
}
