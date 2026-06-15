package com.yourstore.online_store_api.category;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.yourstore.online_store_api.product.Product;

/**
 * JPA entity that represents a product category.
 * Fields map to the `category` table created by Flyway migrations.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "category")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    @NotBlank(message = "Category name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Category slug is required")
    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_media_id")
    private Long imageMediaId;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    

    // owning side is the entity that defines and updates the join table mapping
    // If you add/remove a product from category.products, JPA updates category_product through the owning side.
    @ManyToMany
    @JoinTable(
        name = "category_product",
        joinColumns = @JoinColumn(name = "category_id"),
        inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private Set<Product> products = new HashSet<>();

    public void addProduct(Product product) {
        products.add(product);
        product.getCategories().add(this);
    }

    public void removeProduct(Product product) {
        products.remove(product);
        product.getCategories().remove(this);
    }

}
