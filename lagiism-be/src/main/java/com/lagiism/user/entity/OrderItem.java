package com.lagiism.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "product_slug", nullable = false, length = 80)
    private String productSlug;

    @Column(name = "product_name", nullable = false, length = 180)
    private String productName;

    @Column(nullable = false, length = 16)
    private String size;

    @Column(name = "color_name", length = 80)
    private String colorName;

    @Column(name = "unit_price_vnd", nullable = false)
    private long unitPriceVnd;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;
}
