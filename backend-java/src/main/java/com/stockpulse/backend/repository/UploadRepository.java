package com.stockpulse.backend.repository;

import com.stockpulse.backend.entity.UploadEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UploadRepository extends JpaRepository<UploadEntity, String> {
    Optional<UploadEntity> findByUploadId(String uploadId);
}
