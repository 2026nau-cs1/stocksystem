package com.stockpulse.backend.controller;

import com.stockpulse.backend.api.ApiResponse;
import com.stockpulse.backend.service.UploadService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private final UploadService uploadService;

    public UploadController(UploadService uploadService) {
        this.uploadService = uploadService;
    }

    @PostMapping("/presigned-url")
    public ApiResponse<Map<String, Object>> presignedUrl(@Valid @RequestBody PresignedUrlRequest request) {
        return ApiResponse.success(uploadService.createPresignedUrl(request.fileName(), request.fileType(), request.fileSize()));
    }

    @PostMapping("/complete")
    public ApiResponse<Map<String, Object>> complete(@Valid @RequestBody CompleteUploadRequest request) {
        return ApiResponse.success(
                uploadService.completeUpload(
                        request.uploadId(),
                        request.fileName(),
                        request.fileSize(),
                        request.fileType(),
                        request.s3Key()
                )
        );
    }

    public record PresignedUrlRequest(
            @NotBlank(message = "fileName is required") String fileName,
            @NotBlank(message = "fileType is required") String fileType,
            @NotNull(message = "fileSize is required") @Min(value = 1, message = "fileSize must be positive") Integer fileSize
    ) {}

    public record CompleteUploadRequest(
            @NotBlank(message = "uploadId is required") String uploadId,
            @NotBlank(message = "fileName is required") String fileName,
            @NotNull(message = "fileSize is required") @Min(value = 1, message = "fileSize must be positive") Integer fileSize,
            @NotBlank(message = "fileType is required") String fileType,
            @NotBlank(message = "s3Key is required") String s3Key
    ) {}
}
