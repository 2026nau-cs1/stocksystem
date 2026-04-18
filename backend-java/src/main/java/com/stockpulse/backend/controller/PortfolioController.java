package com.stockpulse.backend.controller;

import com.stockpulse.backend.api.ApiResponse;
import com.stockpulse.backend.entity.PortfolioHoldingEntity;
import com.stockpulse.backend.exception.ApiException;
import com.stockpulse.backend.repository.PortfolioHoldingRepository;
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
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioHoldingRepository repository;
    private final EntityResponseMapper mapper;

    public PortfolioController(PortfolioHoldingRepository repository, EntityResponseMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> list(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ApiResponse.success(repository.findByUserIdOrderByCreatedAtDesc(principal.id()).stream().map(mapper::holding).toList());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Map<String, Object>> create(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody HoldingRequest request
    ) {
        PortfolioHoldingEntity entity = new PortfolioHoldingEntity();
        entity.setUserId(principal.id());
        entity.setSymbol(request.symbol());
        entity.setName(request.name());
        entity.setShares(new BigDecimal(request.shares()));
        entity.setCostPrice(new BigDecimal(request.costPrice()));
        entity.setCurrentPrice(new BigDecimal(request.currentPrice() == null || request.currentPrice().isBlank() ? "0" : request.currentPrice()));
        return ApiResponse.success(mapper.holding(repository.save(entity)));
    }

    @PutMapping("/{id}")
    public ApiResponse<Map<String, Object>> update(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @PathVariable String id,
            @RequestBody UpdateHoldingRequest request
    ) {
        PortfolioHoldingEntity entity = repository.findByIdAndUserId(id, principal.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Holding not found"));
        if (request.shares() != null) {
            entity.setShares(new BigDecimal(request.shares()));
        }
        if (request.costPrice() != null) {
            entity.setCostPrice(new BigDecimal(request.costPrice()));
        }
        if (request.currentPrice() != null) {
            entity.setCurrentPrice(new BigDecimal(request.currentPrice()));
        }
        return ApiResponse.success(mapper.holding(repository.save(entity)));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ApiResponse<Void> delete(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable String id) {
        if (!repository.existsByIdAndUserId(id, principal.id())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Holding not found");
        }
        repository.deleteByIdAndUserId(id, principal.id());
        return ApiResponse.success(null);
    }

    public record HoldingRequest(
            @NotBlank(message = "Symbol is required") String symbol,
            @NotBlank(message = "Name is required") String name,
            @NotBlank(message = "Shares is required") String shares,
            @NotBlank(message = "Cost price is required") String costPrice,
            String currentPrice
    ) {}

    public record UpdateHoldingRequest(String shares, String costPrice, String currentPrice) {}
}
