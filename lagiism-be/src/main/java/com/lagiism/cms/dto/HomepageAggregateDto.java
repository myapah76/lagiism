package com.lagiism.cms.dto;

import java.util.List;
import java.util.Map;

public record HomepageAggregateDto(
        CmsHeroDto hero,
        List<CmsSectionDto> sections,
        List<CmsReviewDto> reviews,
        Map<String, String> settings
) {}
