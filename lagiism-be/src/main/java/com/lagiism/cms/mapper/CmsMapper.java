package com.lagiism.cms.mapper;

import com.lagiism.cms.dto.*;
import com.lagiism.cms.entity.CmsHero;
import com.lagiism.cms.entity.CmsReview;
import com.lagiism.cms.entity.CmsSection;
import org.springframework.stereotype.Component;

@Component
public class CmsMapper {

    public CmsHeroDto toHeroDto(CmsHero hero) {
        return new CmsHeroDto(
                hero.getId(),
                hero.getHeadline(),
                hero.getSubheadline(),
                hero.getBadgeText(),
                hero.getPrimaryCtaLabel(),
                hero.getSecondaryCtaLabel(),
                hero.getImageUrl(),
                hero.getImagePublicId(),
                hero.isActive(),
                hero.getUpdatedAt()
        );
    }

    public void applyHeroRequest(CmsHero hero, UpdateHeroRequest req) {
        hero.setHeadline(req.headline().trim());
        hero.setSubheadline(req.subheadline().trim());
        hero.setBadgeText(req.badgeText());
        hero.setPrimaryCtaLabel(req.primaryCtaLabel().trim());
        hero.setSecondaryCtaLabel(req.secondaryCtaLabel().trim());
        hero.setImageUrl(req.imageUrl().trim());
        hero.setImagePublicId(req.imagePublicId());
        hero.setActive(req.active());
    }

    public CmsSectionDto toSectionDto(CmsSection section) {
        return new CmsSectionDto(
                section.getId(),
                section.getSectionKey(),
                section.getTitle(),
                section.getSubtitle(),
                section.getContent(),
                section.getImageUrl(),
                section.getImagePublicId(),
                section.getSortOrder(),
                section.isActive(),
                section.getUpdatedAt()
        );
    }

    public void applySectionRequest(CmsSection section, SaveSectionRequest req) {
        section.setSectionKey(req.sectionKey().trim());
        section.setTitle(req.title().trim());
        section.setSubtitle(req.subtitle());
        section.setContent(req.content());
        section.setImageUrl(req.imageUrl());
        section.setImagePublicId(req.imagePublicId());
        section.setSortOrder(req.sortOrder());
        section.setActive(req.active());
    }

    public CmsReviewDto toReviewDto(CmsReview review) {
        return new CmsReviewDto(
                review.getId(),
                review.getAuthorName(),
                review.getAuthorLocation(),
                review.getRating(),
                review.getComment(),
                review.isFeatured(),
                review.getSortOrder(),
                review.getCreatedAt()
        );
    }

    public void applyReviewRequest(CmsReview review, SaveReviewRequest req) {
        review.setAuthorName(req.authorName().trim());
        review.setAuthorLocation(req.authorLocation());
        review.setRating(req.rating());
        review.setComment(req.comment().trim());
        review.setFeatured(req.featured());
        review.setSortOrder(req.sortOrder());
    }
}
