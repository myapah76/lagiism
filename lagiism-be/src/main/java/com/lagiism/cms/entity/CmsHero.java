package com.lagiism.cms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "cms_heroes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CmsHero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String headline;

    @Column(nullable = false, length = 300)
    private String subheadline;

    @Column(name = "badge_text", length = 120)
    private String badgeText;

    @Column(name = "primary_cta_label", nullable = false, length = 80)
    private String primaryCtaLabel;

    @Column(name = "secondary_cta_label", nullable = false, length = 80)
    private String secondaryCtaLabel;

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "image_public_id", length = 255)
    private String imagePublicId;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
