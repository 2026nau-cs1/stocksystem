package com.stockpulse.backend.repository;

import com.stockpulse.backend.entity.WatchlistItemEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WatchlistItemRepository extends JpaRepository<WatchlistItemEntity, String> {
    List<WatchlistItemEntity> findByUserIdOrderByCreatedAtAsc(String userId);
    List<WatchlistItemEntity> findByGroupIdAndUserIdOrderByCreatedAtAsc(String groupId, String userId);
    boolean existsByIdAndUserId(String id, String userId);
    void deleteByIdAndUserId(String id, String userId);
}
