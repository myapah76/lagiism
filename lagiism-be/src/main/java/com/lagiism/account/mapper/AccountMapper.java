package com.lagiism.account.mapper;

import com.lagiism.account.dto.AccountDto;
import com.lagiism.account.dto.AuditLogDto;
import com.lagiism.account.dto.UpdateAccountRequest;
import com.lagiism.account.entity.AdminAuditLog;
import com.lagiism.account.entity.Role;
import com.lagiism.account.entity.User;
import org.springframework.stereotype.Component;

@Component
public class AccountMapper {

    public AccountDto toAccountDto(User user) {
        return new AccountDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPrimaryRole(),
                user.getRoleNames(),
                user.getAuthProvider(),
                user.getAvatarUrl(),
                user.isActive(),
                user.getLastLoginAt(),
                user.getCreatedAt()
        );
    }

    public AuditLogDto toAuditLogDto(AdminAuditLog log) {
        return new AuditLogDto(
                log.getId(),
                log.getActorEmail(),
                log.getAction(),
                log.getTargetType(),
                log.getTargetId(),
                log.getDetails(),
                log.getCreatedAt()
        );
    }

    public void applyUpdate(User user, UpdateAccountRequest request, Role role) {
        user.setFullName(request.fullName().trim());
        user.getRoles().clear();
        user.getRoles().add(role);
        user.setActive(request.active());
    }
}
