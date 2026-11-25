package com.lagiism.database.dto;

import java.util.List;

public record SqlPreviewDto(
        int totalLines,
        int statementCount,
        boolean containsDropOrTruncate,
        List<String> sampleLines
) {}
