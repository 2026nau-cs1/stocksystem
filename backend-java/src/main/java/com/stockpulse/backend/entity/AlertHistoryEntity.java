package com.stockpulse.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "AlertHistory")
public class AlertHistoryEntity {

    @Id
    private String id;

    @Column(name = "alert_id", nullable = false)
    private String alertId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private String symbol;

    @Column(name = "stock_name", nullable = false)
    private String stockName;

    @Column(name = "trigger_price", nullable = false, precision = 18, scale = 4)
    private BigDecimal triggerPrice;

    @Column(name = "condition_type", nullable = false)
    private String conditionType;

    @Column(name = "condition_value", nullable = false, precision = 18, scale = 4)
    private BigDecimal conditionValue;

    @Column(name = "triggered_at", nullable = false)
    private LocalDateTime triggeredAt;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (triggeredAt == null) {
            triggeredAt = LocalDateTime.now();
        }
    }
}
