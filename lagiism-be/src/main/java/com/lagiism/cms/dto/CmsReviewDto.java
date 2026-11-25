package com.lagiism.cms.dto;

import java.time.Instant;

public record CmsReviewDto(
        Long id,
        String authorName,
        String authorLocation,
        int rating,
        String comment,
        boolean featured,
        int sortOrder,
        Instant createdAt
) {}
