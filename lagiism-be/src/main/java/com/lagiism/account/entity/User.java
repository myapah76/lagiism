package com.lagiism.account.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 180)
    private String email;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "auth_provider", nullable = false, length = 32)
    @Builder.Default
    private String authProvider = "LOCAL";

    @Column(name = "google_sub", unique = true, length = 128)
    private String googleSub;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public List<String> getRoleNames() {
        return roles.stream()
                .map(r -> r.getName().name())
                .sorted()
                .toList();
    }

    public String getPrimaryRole() {
        return roles.stream()
                .map(Role::getName)
                .max(Comparator.comparingInt(Enum::ordinal))
                .map(Enum::name)
                .orElse(RoleName.USER.name());
    }
}
