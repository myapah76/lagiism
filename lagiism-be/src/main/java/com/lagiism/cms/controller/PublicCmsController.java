package com.lagiism.cms.controller;

import com.lagiism.cms.dto.HomepageAggregateDto;
import com.lagiism.cms.service.CmsService;
import com.lagiism.shared.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicCmsController {

    private final CmsService cmsService;

    @GetMapping("/homepage")
    public ApiResponse<HomepageAggregateDto> getHomepage() {
        return ApiResponse.ok(cmsService.getPublicHomepage());
    }
}
