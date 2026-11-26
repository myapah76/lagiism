package com.lagiism.account.service;

import com.lagiism.account.dto.AccountDto;
import com.lagiism.account.dto.CreateAccountRequest;
import com.lagiism.account.dto.UpdateAccountRequest;
import com.lagiism.account.entity.Role;
import com.lagiism.account.entity.RoleName;
import com.lagiism.account.entity.User;
import com.lagiism.account.mapper.AccountMapper;
import com.lagiism.account.repository.RoleRepository;
import com.lagiism.account.repository.UserRepository;
import com.lagiism.shared.BadRequestException;
import com.lagiism.shared.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final AccountMapper accountMapper;

    @Transactional(readOnly = true)
    public List<AccountDto> listAll(String query) {
        String q = query != null ? query.trim().toLowerCase() : "";
        return userRepository.findAll().stream()
                .filter(u -> q.isEmpty()
                        || (u.getFullName() != null && u.getFullName().toLowerCase().contains(q))
                        || (u.getPhone() != null && u.getPhone().toLowerCase().contains(q))
                        || (u.getEmail() != null && u.getEmail().toLowerCase().contains(q)))
                .map(accountMapper::toAccountDto)
                .toList();
    }

    @Transactional
    public AccountDto create(CreateAccountRequest request, String actorEmail) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("Account with this email already exists");
        }
        Role role = resolveRole(request.role());
        User user = User.builder()
                .email(request.email().trim().toLowerCase())
                .fullName(request.fullName().trim())
                .passwordHash(passwordEncoder.encode(request.password()))
                .authProvider("LOCAL")
                .roles(new HashSet<>(Set.of(role)))
                .active(true)
                .build();
        User saved = userRepository.save(user);
        auditLogService.record(actorEmail, "USER_CREATED", "USER", String.valueOf(saved.getId()),
                "Created user " + saved.getEmail() + " with role " + role.getName());
        return accountMapper.toAccountDto(saved);
    }

    @Transactional
    public AccountDto update(Long id, UpdateAccountRequest request, String actorEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        Role role = resolveRole(request.role());
        accountMapper.applyUpdate(user, request, role);
        User saved = userRepository.save(user);
        auditLogService.record(actorEmail, "USER_UPDATED", "USER", String.valueOf(saved.getId()),
                "Updated user " + saved.getEmail());
        return accountMapper.toAccountDto(saved);
    }

    @Transactional
    public void delete(Long id, String actorEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        if (user.getEmail().equalsIgnoreCase(actorEmail)) {
            throw new BadRequestException("Cannot delete your own active account");
        }
        userRepository.delete(user);
        auditLogService.record(actorEmail, "USER_DELETED", "USER", String.valueOf(id),
                "Deleted user " + user.getEmail());
    }

    private Role resolveRole(String roleStr) {
        RoleName roleName;
        try {
            roleName = RoleName.valueOf(roleStr.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Role must be ADMIN, STAFF, or USER");
        }
        return roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
    }
}
