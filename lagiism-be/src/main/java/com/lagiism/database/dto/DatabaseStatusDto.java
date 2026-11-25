package com.lagiism.database.dto;

import java.util.Map;

public record DatabaseStatusDto(
        String databaseProduct,
        String databaseVersion,
        boolean healthy,
        Map<String, Long> tableCounts
) {}
