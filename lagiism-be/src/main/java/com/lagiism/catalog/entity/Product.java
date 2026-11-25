package com.lagiism.catalog.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String slug;

    @Column(nullable = false, unique = true, length = 60)
    private String sku;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(name = "name_vi", length = 180)
    private String nameVi;

    @Column(name = "price_vnd", nullable = false)
    private long priceVnd;

    @Column(name = "category_code", nullable = false, length = 40)
    private String categoryCode;

    @Column(name = "set_slot", nullable = false, length = 20)
    @Builder.Default
    private String setSlot = "NONE";

    @Column(name = "color_name", nullable = false, length = 80)
    private String colorName;

    @Column(name = "color_hex", nullable = false, length = 16)
    private String colorHex;

    @Column(name = "sizes_csv", nullable = false, length = 80)
    @Builder.Default
    private String sizesCsv = "S,M,L,XL";

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "image_public_id", length = 255)
    private String imagePublicId;

    @Column(name = "secondary_image_url", columnDefinition = "TEXT")
    private String secondaryImageUrl;

    @Column(name = "secondary_image_public_id", length = 255)
    private String secondaryImagePublicId;

    @Column(name = "glb_model_slot", length = 255)
    private String glbModelSlot;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 80)
    private String gsm;

    @Column(length = 120)
    private String fabric;

    @Column(length = 120)
    private String fit;

    @Column(length = 120)
    private String origin;

    @Column(length = 120)
    private String coordinates;

    @Column(name = "badge_text", length = 60)
    private String badgeText;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;

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
}
