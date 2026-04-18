package com.stockpulse.backend.controller;

import com.stockpulse.backend.api.ApiResponse;
import com.stockpulse.backend.entity.FeedbackEntity;
import com.stockpulse.backend.repository.FeedbackRepository;
import com.stockpulse.backend.security.AuthenticatedUser;
import com.stockpulse.backend.service.EntityResponseMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;
    private final EntityResponseMapper mapper;

    public FeedbackController(FeedbackRepository feedbackRepository, EntityResponseMapper mapper) {
        this.feedbackRepository = feedbackRepository;
        this.mapper = mapper;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Map<String, Object>> submit(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody FeedbackRequest request
    ) {
        FeedbackEntity entity = new FeedbackEntity();
        entity.setUserId(principal.id());
        entity.setContent(request.content());
        return ApiResponse.success(mapper.feedback(feedbackRepository.save(entity)));
    }

    public record FeedbackRequest(@NotBlank(message = "Feedback content is required") String content) {}
}
