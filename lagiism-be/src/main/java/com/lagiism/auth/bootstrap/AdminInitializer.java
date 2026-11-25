package com.lagiism.auth.bootstrap;

import com.lagiism.account.entity.Role;
import com.lagiism.account.entity.RoleName;
import com.lagiism.account.entity.User;
import com.lagiism.account.repository.RoleRepository;
import com.lagiism.account.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            return;
        }
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            log.warn("No users exist and ADMIN_EMAIL / ADMIN_PASSWORD are not configured.");
            return;
        }

        Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(RoleName.ADMIN)
                        .description("Full system administrator")
                        .build()));

        User admin = User.builder()
                .email(adminEmail.trim().toLowerCase())
                .fullName("LAGIISM Super Admin")
                .passwordHash(passwordEncoder.encode(adminPassword))
                .authProvider("LOCAL")
                .roles(new HashSet<>(Set.of(adminRole)))
                .active(true)
                .build();
        userRepository.save(admin);
        log.info("Bootstrapped initial ADMIN user for {}", admin.getEmail());
    }
}
