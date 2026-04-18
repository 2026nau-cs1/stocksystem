package com.stockpulse.backend.repository;

import com.stockpulse.backend.entity.WatchlistGroupEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WatchlistGroupRepository extends JpaRepository<WatchlistGroupEntity, String> {
    List<WatchlistGroupEntity> findByUserIdOrderByCreatedAtAsc(String userId);
    boolean existsByIdAndUserId(String id, String userId);
    void deleteByIdAndUserId(String id, String userId);
}
