package com.lagiism.cms.repository;

import com.lagiism.cms.entity.CmsReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CmsReviewRepository extends JpaRepository<CmsReview, Long> {
    List<CmsReview> findAllByFeaturedTrueOrderBySortOrderAsc();
    List<CmsReview> findAllByOrderBySortOrderAsc();
}
