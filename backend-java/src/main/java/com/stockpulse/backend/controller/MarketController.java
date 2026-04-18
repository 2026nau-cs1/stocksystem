package com.stockpulse.backend.controller;

import com.stockpulse.backend.api.ApiResponse;
import com.stockpulse.backend.service.MarketMockService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    private final MarketMockService marketMockService;

    public MarketController(MarketMockService marketMockService) {
        this.marketMockService = marketMockService;
    }

    @GetMapping("/indices")
    public ApiResponse<List<Map<String, Object>>> indices() {
        return ApiResponse.success(marketMockService.indices());
    }

    @GetMapping("/quote/{code}")
    public ApiResponse<Map<String, Object>> quote(@PathVariable String code) {
        return ApiResponse.success(marketMockService.quote(code));
    }

    @GetMapping("/stocks")
    public ApiResponse<List<Map<String, Object>>> stocks() {
        return ApiResponse.success(marketMockService.stockCatalog());
    }

    @GetMapping("/search")
    public ApiResponse<List<Map<String, Object>>> search(@RequestParam String q) {
        return ApiResponse.success(marketMockService.searchStocks(q));
    }

    @GetMapping("/sectors")
    public ApiResponse<List<Map<String, Object>>> sectors() {
        return ApiResponse.success(marketMockService.sectors());
    }

    @GetMapping("/news")
    public ApiResponse<List<Map<String, Object>>> news(@RequestParam(required = false) String category) {
        return ApiResponse.success(marketMockService.news(category));
    }

    @GetMapping("/fundamentals/{code}")
    public ApiResponse<Map<String, Object>> fundamentals(@PathVariable String code) {
        return ApiResponse.success(marketMockService.fundamentals(code));
    }

    @GetMapping("/kline/{code}")
    public ApiResponse<List<Map<String, Object>>> kline(@PathVariable String code) {
        return ApiResponse.success(marketMockService.kLine(code));
    }

    @GetMapping("/stock-rank")
    public ApiResponse<List<Map<String, Object>>> stockRank() {
        return ApiResponse.success(marketMockService.stockRank(), System.currentTimeMillis(), "mock");
    }
}
