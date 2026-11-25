package com.lagiism.cms.repository;

import com.lagiism.cms.entity.SiteSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SiteSettingRepository extends JpaRepository<SiteSetting, Long> {
    Optional<SiteSetting> findBySettingKey(String settingKey);
}
