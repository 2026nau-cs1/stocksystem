package com.stockpulse.backend.controller;

import com.stockpulse.backend.api.ApiResponse;
import com.stockpulse.backend.entity.WatchlistGroupEntity;
import com.stockpulse.backend.entity.WatchlistItemEntity;
import com.stockpulse.backend.exception.ApiException;
import com.stockpulse.backend.repository.WatchlistGroupRepository;
import com.stockpulse.backend.repository.WatchlistItemRepository;
import com.stockpulse.backend.security.AuthenticatedUser;
import com.stockpulse.backend.service.EntityResponseMapper;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistGroupRepository groupRepository;
    private final WatchlistItemRepository itemRepository;
    private final EntityResponseMapper mapper;

    public WatchlistController(
            WatchlistGroupRepository groupRepository,
            WatchlistItemRepository itemRepository,
            EntityResponseMapper mapper
    ) {
        this.groupRepository = groupRepository;
        this.itemRepository = itemRepository;
        this.mapper = mapper;
    }

    @GetMapping("/groups")
    public ApiResponse<List<Map<String, Object>>> groups(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ApiResponse.success(groupRepository.findByUserIdOrderByCreatedAtAsc(principal.id()).stream().map(mapper::watchlistGroup).toList());
    }

    @PostMapping("/groups")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Map<String, Object>> createGroup(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody GroupRequest request
    ) {
        WatchlistGroupEntity entity = new WatchlistGroupEntity();
        entity.setUserId(principal.id());
        entity.setName(request.name());
        return ApiResponse.success(mapper.watchlistGroup(groupRepository.save(entity)));
    }

    @DeleteMapping("/groups/{id}")
    @Transactional
    public ApiResponse<Void> deleteGroup(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable String id) {
        if (!groupRepository.existsByIdAndUserId(id, principal.id())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Group not found");
        }
        groupRepository.deleteByIdAndUserId(id, principal.id());
        return ApiResponse.success(null);
    }

    @GetMapping("/groups/{groupId}/items")
    public ApiResponse<List<Map<String, Object>>> itemsByGroup(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @PathVariable String groupId
    ) {
        return ApiResponse.success(itemRepository.findByGroupIdAndUserIdOrderByCreatedAtAsc(groupId, principal.id()).stream().map(mapper::watchlistItem).toList());
    }

    @GetMapping("/items")
    public ApiResponse<List<Map<String, Object>>> items(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ApiResponse.success(itemRepository.findByUserIdOrderByCreatedAtAsc(principal.id()).stream().map(mapper::watchlistItem).toList());
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Map<String, Object>> createItem(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody ItemRequest request
    ) {
        WatchlistItemEntity entity = new WatchlistItemEntity();
        entity.setUserId(principal.id());
        entity.setGroupId(request.groupId());
        entity.setSymbol(request.symbol());
        entity.setName(request.name());
        return ApiResponse.success(mapper.watchlistItem(itemRepository.save(entity)));
    }

    @DeleteMapping("/items/{id}")
    @Transactional
    public ApiResponse<Void> deleteItem(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable String id) {
        if (!itemRepository.existsByIdAndUserId(id, principal.id())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Item not found");
        }
        itemRepository.deleteByIdAndUserId(id, principal.id());
        return ApiResponse.success(null);
    }

    public record GroupRequest(@NotBlank(message = "Group name is required") String name) {}

    public record ItemRequest(
            @NotBlank(message = "Group id is required") String groupId,
            @NotBlank(message = "Symbol is required") String symbol,
            @NotBlank(message = "Name is required") String name
    ) {}
}
