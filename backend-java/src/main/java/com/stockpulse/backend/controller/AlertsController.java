package com.stockpulse.backend.controller;

import com.stockpulse.backend.api.ApiResponse;
import com.stockpulse.backend.entity.AlertEntity;
import com.stockpulse.backend.exception.ApiException;
import com.stockpulse.backend.repository.AlertHistoryRepository;
import com.stockpulse.backend.repository.AlertRepository;
import com.stockpulse.backend.security.AuthenticatedUser;
import com.stockpulse.backend.service.EntityResponseMapper;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/alerts")
public class AlertsController {

    private final AlertRepository alertRepository;
    private final AlertHistoryRepository alertHistoryRepository;
    private final EntityResponseMapper mapper;

    public AlertsController(
            AlertRepository alertRepository,
            AlertHistoryRepository alertHistoryRepository,
            EntityResponseMapper mapper
    ) {
        this.alertRepository = alertRepository;
        this.alertHistoryRepository = alertHistoryRepository;
        this.mapper = mapper;
    }

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> list(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ApiResponse.success(alertRepository.findByUserIdOrderByCreatedAtDesc(principal.id()).stream().map(mapper::alert).toList());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Map<String, Object>> create(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody AlertRequest request
    ) {
        AlertEntity entity = new AlertEntity();
        entity.setUserId(principal.id());
        entity.setSymbol(request.symbol());
        entity.setStockName(request.stockName());
        entity.setConditionType(request.conditionType());
        entity.setConditionValue(new BigDecimal(request.conditionValue()));
        entity.setNotifyApp(request.notifyApp() == null || request.notifyApp());
        entity.setNotifySms(Boolean.TRUE.equals(request.notifySms()));
        entity.setNotifyWechat(Boolean.TRUE.equals(request.notifyWechat()));
        return ApiResponse.success(mapper.alert(alertRepository.save(entity)));
    }

    @PutMapping("/{id}")
    public ApiResponse<Map<String, Object>> update(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @PathVariable String id,
            @RequestBody UpdateAlertRequest request
    ) {
        AlertEntity entity = alertRepository.findByIdAndUserId(id, principal.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Alert not found"));
        if (request.symbol() != null) entity.setSymbol(request.symbol());
        if (request.stockName() != null) entity.setStockName(request.stockName());
        if (request.conditionType() != null) entity.setConditionType(request.conditionType());
        if (request.conditionValue() != null) entity.setConditionValue(new BigDecimal(request.conditionValue()));
        if (request.notifyApp() != null) entity.setNotifyApp(request.notifyApp());
        if (request.notifySms() != null) entity.setNotifySms(request.notifySms());
        if (request.notifyWechat() != null) entity.setNotifyWechat(request.notifyWechat());
        if (request.status() != null) entity.setStatus(request.status());
        return ApiResponse.success(mapper.alert(alertRepository.save(entity)));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ApiResponse<Void> delete(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable String id) {
        if (!alertRepository.existsByIdAndUserId(id, principal.id())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Alert not found");
        }
        alertRepository.deleteByIdAndUserId(id, principal.id());
        return ApiResponse.success(null);
    }

    @GetMapping("/history")
    public ApiResponse<List<Map<String, Object>>> history(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ApiResponse.success(alertHistoryRepository.findTop50ByUserIdOrderByTriggeredAtDesc(principal.id()).stream().map(mapper::alertHistory).toList());
    }

    public record AlertRequest(
            @NotBlank(message = "Symbol is required") String symbol,
            @NotBlank(message = "Stock name is required") String stockName,
            @NotBlank(message = "Condition type is required") String conditionType,
            @NotBlank(message = "Condition value is required") String conditionValue,
            Boolean notifyApp,
            Boolean notifySms,
            Boolean notifyWechat
    ) {}

    public record UpdateAlertRequest(
            String symbol,
            String stockName,
            String conditionType,
            String conditionValue,
            Boolean notifyApp,
            Boolean notifySms,
            Boolean notifyWechat,
            String status
    ) {}
}
