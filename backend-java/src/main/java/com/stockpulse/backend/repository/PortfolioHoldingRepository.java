package com.stockpulse.backend.repository;

import com.stockpulse.backend.entity.PortfolioHoldingEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioHoldingRepository extends JpaRepository<PortfolioHoldingEntity, String> {
    List<PortfolioHoldingEntity> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<PortfolioHoldingEntity> findByIdAndUserId(String id, String userId);
    boolean existsByIdAndUserId(String id, String userId);
    void deleteByIdAndUserId(String id, String userId);
}
