package com.lagiism.cms.service;

import com.lagiism.account.service.AuditLogService;
import com.lagiism.cms.dto.*;
import com.lagiism.cms.entity.CmsHero;
import com.lagiism.cms.entity.CmsReview;
import com.lagiism.cms.entity.CmsSection;
import com.lagiism.cms.entity.SiteSetting;
import com.lagiism.cms.mapper.CmsMapper;
import com.lagiism.cms.repository.CmsHeroRepository;
import com.lagiism.cms.repository.CmsReviewRepository;
import com.lagiism.cms.repository.CmsSectionRepository;
import com.lagiism.cms.repository.SiteSettingRepository;
import com.lagiism.shared.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CmsService {

    private final CmsHeroRepository heroRepository;
    private final CmsSectionRepository sectionRepository;
    private final CmsReviewRepository reviewRepository;
    private final SiteSettingRepository settingRepository;
    private final AuditLogService auditLogService;
    private final CmsMapper cmsMapper;

    @Transactional(readOnly = true)
    public HomepageAggregateDto getPublicHomepage() {
        CmsHeroDto hero = heroRepository.findFirstByActiveTrueOrderByIdAsc()
                .map(cmsMapper::toHeroDto)
                .orElse(null);

        List<CmsSectionDto> sections = sectionRepository.findAllByActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(cmsMapper::toSectionDto)
                .toList();

        List<CmsReviewDto> reviews = reviewRepository.findAllByFeaturedTrueOrderBySortOrderAsc()
                .stream()
                .map(cmsMapper::toReviewDto)
                .toList();

        Map<String, String> settings = new LinkedHashMap<>();
        for (SiteSetting s : settingRepository.findAll()) {
            settings.put(s.getSettingKey(), s.getSettingValue());
        }

        return new HomepageAggregateDto(hero, sections, reviews, settings);
    }

    @Transactional
    public CmsHeroDto updateHero(UpdateHeroRequest request, String actorEmail) {
        CmsHero hero = heroRepository.findFirstByActiveTrueOrderByIdAsc().orElseGet(CmsHero::new);
        cmsMapper.applyHeroRequest(hero, request);

        CmsHero saved = heroRepository.save(hero);
        auditLogService.record(actorEmail, "CMS_HERO_UPDATED", "CMS_HERO", String.valueOf(saved.getId()),
                "Updated hero headline: " + saved.getHeadline());
        return cmsMapper.toHeroDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CmsSectionDto> listAllSections() {
        return sectionRepository.findAllByOrderBySortOrderAsc().stream()
                .map(cmsMapper::toSectionDto)
                .toList();
    }

    @Transactional
    public CmsSectionDto saveSection(Long id, SaveSectionRequest request, String actorEmail) {
        CmsSection section = (id != null)
                ? sectionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Section not found: " + id))
                : sectionRepository.findBySectionKey(request.sectionKey().trim()).orElseGet(CmsSection::new);

        cmsMapper.applySectionRequest(section, request);

        CmsSection saved = sectionRepository.save(section);
        auditLogService.record(actorEmail, "CMS_SECTION_SAVED", "CMS_SECTION", String.valueOf(saved.getId()),
                "Saved section " + saved.getSectionKey());
        return cmsMapper.toSectionDto(saved);
    }

    @Transactional
    public void deleteSection(Long id, String actorEmail) {
        CmsSection section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found: " + id));
        sectionRepository.delete(section);
        auditLogService.record(actorEmail, "CMS_SECTION_DELETED", "CMS_SECTION", String.valueOf(id),
                "Deleted section " + section.getSectionKey());
    }

    @Transactional(readOnly = true)
    public List<CmsReviewDto> listAllReviews() {
        return reviewRepository.findAllByOrderBySortOrderAsc().stream()
                .map(cmsMapper::toReviewDto)
                .toList();
    }

    @Transactional
    public CmsReviewDto saveReview(Long id, SaveReviewRequest request, String actorEmail) {
        CmsReview review = (id != null)
                ? reviewRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + id))
                : new CmsReview();

        cmsMapper.applyReviewRequest(review, request);

        CmsReview saved = reviewRepository.save(review);
        auditLogService.record(actorEmail, "CMS_REVIEW_SAVED", "CMS_REVIEW", String.valueOf(saved.getId()),
                "Saved review by " + saved.getAuthorName());
        return cmsMapper.toReviewDto(saved);
    }

    @Transactional
    public void deleteReview(Long id, String actorEmail) {
        CmsReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + id));
        reviewRepository.delete(review);
        auditLogService.record(actorEmail, "CMS_REVIEW_DELETED", "CMS_REVIEW", String.valueOf(id),
                "Deleted review by " + review.getAuthorName());
    }

    @Transactional
    public Map<String, String> updateSettings(Map<String, String> updates, String actorEmail) {
        for (Map.Entry<String, String> entry : updates.entrySet()) {
            SiteSetting setting = settingRepository.findBySettingKey(entry.getKey())
                    .orElseGet(() -> SiteSetting.builder().settingKey(entry.getKey()).build());
            setting.setSettingValue(entry.getValue() != null ? entry.getValue() : "");
            settingRepository.save(setting);
        }
        auditLogService.record(actorEmail, "CMS_SETTINGS_UPDATED", "SITE_SETTING", null,
                "Updated " + updates.size() + " settings");

        Map<String, String> all = new LinkedHashMap<>();
        for (SiteSetting s : settingRepository.findAll()) {
            all.put(s.getSettingKey(), s.getSettingValue());
        }
        return all;
    }
}
