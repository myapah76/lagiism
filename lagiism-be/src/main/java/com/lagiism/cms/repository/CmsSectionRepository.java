package com.lagiism.cms.repository;

import com.lagiism.cms.entity.CmsSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CmsSectionRepository extends JpaRepository<CmsSection, Long> {
    List<CmsSection> findAllByActiveTrueOrderBySortOrderAsc();
    List<CmsSection> findAllByOrderBySortOrderAsc();
    Optional<CmsSection> findBySectionKey(String sectionKey);
}
