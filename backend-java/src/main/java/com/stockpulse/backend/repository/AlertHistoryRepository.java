package com.stockpulse.backend.repository;

import com.stockpulse.backend.entity.AlertHistoryEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertHistoryRepository extends JpaRepository<AlertHistoryEntity, String> {
    List<AlertHistoryEntity> findTop50ByUserIdOrderByTriggeredAtDesc(String userId);
}
