package com.lagiism.cms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "cms_sections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CmsSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "section_key", nullable = false, unique = true, length = 80)
    private String sectionKey;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 300)
    private String subtitle;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "image_public_id", length = 255)
    private String imagePublicId;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;

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
