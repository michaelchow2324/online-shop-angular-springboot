package com.yourstore.online_store_api.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.yourstore.online_store_api.category.Category;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "product")
public class Product {

    // ON INSERT, the database generates a new id for the product and returns it.
    // Hibernate reads that generated id back and puts it into the entity.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Product slug is required")
    @Column(nullable = false, unique = true)
    private String slug;

    // It is stored as a large text column, not a short default varchar.
    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @DecimalMin(value = "0.00", inclusive = true, message = "Price must be non-negative")
    @Digits(integer = 10, fraction = 2) // Validates that price has at most 10 digits and 2 decimal places
    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "image_media_id")
    private Long imageMediaId;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    
    // Use a List when order matters, duplicates are allowed, or you need index-based access. 
    // Use a Set when you want unique items and fast membership checks, and order usually does not matter.

    //use bidirectional relationship when we need to navigate from both sides.
    // e.g. product.getCategories() and category.getProducts() are both needed in the service layer.
    @ManyToMany(mappedBy = "products")
    private Set<Category> categories = new HashSet<>();    

    public void addCategory(Category category) {
        this.categories.add(category);
        category.getProducts().add(this);
    }

    public void removeCategory(Category category) {
        this.categories.remove(category);
        category.getProducts().remove(this);
    }

}
