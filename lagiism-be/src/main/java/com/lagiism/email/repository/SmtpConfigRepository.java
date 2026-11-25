package com.lagiism.email.repository;

import com.lagiism.email.entity.SmtpConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SmtpConfigRepository extends JpaRepository<SmtpConfig, Long> {
    Optional<SmtpConfig> findTopByOrderByIdAsc();
}
