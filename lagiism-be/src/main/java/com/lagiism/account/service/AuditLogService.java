package com.lagiism.account.service;

import com.lagiism.account.dto.AuditLogDto;
import com.lagiism.account.entity.AdminAuditLog;
import com.lagiism.account.mapper.AccountMapper;
import com.lagiism.account.repository.AdminAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AdminAuditLogRepository auditLogRepository;
    private final AccountMapper accountMapper;

    @Transactional
    public void record(String actorEmail, String action, String targetType, String targetId, String details) {
        AdminAuditLog log = AdminAuditLog.builder()
                .actorEmail(actorEmail != null ? actorEmail : "system")
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getRecentLogs() {
        return auditLogRepository.findTop100ByOrderByCreatedAtDesc()
                .stream()
                .map(accountMapper::toAuditLogDto)
                .toList();
    }
}
