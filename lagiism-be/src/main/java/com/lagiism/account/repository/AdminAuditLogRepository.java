package com.lagiism.account.repository;

import com.lagiism.account.entity.AdminAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, Long> {
    List<AdminAuditLog> findTop100ByOrderByCreatedAtDesc();
}
