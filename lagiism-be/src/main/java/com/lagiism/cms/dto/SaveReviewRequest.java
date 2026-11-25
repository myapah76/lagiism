package com.lagiism.cms.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record SaveReviewRequest(
        @NotBlank String authorName,
        String authorLocation,
        @Min(1) @Max(5) int rating,
        @NotBlank String comment,
        boolean featured,
        int sortOrder
) {}
