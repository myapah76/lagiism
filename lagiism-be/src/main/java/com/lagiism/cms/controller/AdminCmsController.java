package com.lagiism.cms.controller;

import com.lagiism.cms.dto.*;
import com.lagiism.cms.service.CmsService;
import com.lagiism.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/cms")
@RequiredArgsConstructor
public class AdminCmsController {

    private final CmsService cmsService;

    @GetMapping("/homepage")
    public ApiResponse<HomepageAggregateDto> getAggregate() {
        return ApiResponse.ok(cmsService.getPublicHomepage());
    }

    @PutMapping("/hero")
    public ApiResponse<CmsHeroDto> updateHero(@Valid @RequestBody UpdateHeroRequest request,
                                              Authentication authentication) {
        return ApiResponse.ok("Hero updated", cmsService.updateHero(request, authentication.getName()));
    }

    @GetMapping("/sections")
    public ApiResponse<List<CmsSectionDto>> listSections() {
        return ApiResponse.ok(cmsService.listAllSections());
    }

    @PostMapping("/sections")
    public ApiResponse<CmsSectionDto> createSection(@Valid @RequestBody SaveSectionRequest request,
                                                    Authentication authentication) {
        return ApiResponse.ok("Section created", cmsService.saveSection(null, request, authentication.getName()));
    }

    @PutMapping("/sections/{id}")
    public ApiResponse<CmsSectionDto> updateSection(@PathVariable Long id,
                                                    @Valid @RequestBody SaveSectionRequest request,
                                                    Authentication authentication) {
        return ApiResponse.ok("Section updated", cmsService.saveSection(id, request, authentication.getName()));
    }

    @DeleteMapping("/sections/{id}")
    public ApiResponse<Void> deleteSection(@PathVariable Long id, Authentication authentication) {
        cmsService.deleteSection(id, authentication.getName());
        return ApiResponse.ok("Section deleted", null);
    }

    @GetMapping("/reviews")
    public ApiResponse<List<CmsReviewDto>> listReviews() {
        return ApiResponse.ok(cmsService.listAllReviews());
    }

    @PostMapping("/reviews")
    public ApiResponse<CmsReviewDto> createReview(@Valid @RequestBody SaveReviewRequest request,
                                                  Authentication authentication) {
        return ApiResponse.ok("Review created", cmsService.saveReview(null, request, authentication.getName()));
    }

    @PutMapping("/reviews/{id}")
    public ApiResponse<CmsReviewDto> updateReview(@PathVariable Long id,
                                                  @Valid @RequestBody SaveReviewRequest request,
                                                  Authentication authentication) {
        return ApiResponse.ok("Review updated", cmsService.saveReview(id, request, authentication.getName()));
    }

    @DeleteMapping("/reviews/{id}")
    public ApiResponse<Void> deleteReview(@PathVariable Long id, Authentication authentication) {
        cmsService.deleteReview(id, authentication.getName());
        return ApiResponse.ok("Review deleted", null);
    }

    @PutMapping("/settings")
    public ApiResponse<Map<String, String>> updateSettings(@RequestBody Map<String, String> updates,
                                                           Authentication authentication) {
        return ApiResponse.ok("Settings updated", cmsService.updateSettings(updates, authentication.getName()));
    }
}
