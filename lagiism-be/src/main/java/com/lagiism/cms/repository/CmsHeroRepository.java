package com.lagiism.cms.repository;

import com.lagiism.cms.entity.CmsHero;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CmsHeroRepository extends JpaRepository<CmsHero, Long> {
    Optional<CmsHero> findFirstByActiveTrueOrderByIdAsc();
}
