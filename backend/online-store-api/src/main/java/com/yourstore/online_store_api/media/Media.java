package com.yourstore.online_store_api.media;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing media records (images/files) stored externally.
 * Links an owning entity type/id to a storage key that an ImageStorageService
 * can convert into a public URL.
 */
@Entity
@Table(name = "media")
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "storage_key", nullable = false, length = 1024)
    private String storageKey;

    @Column(length = 512)
    private String alt;

    @Column(name = "is_primary")
    private boolean isPrimary;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    public Media() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStorageKey() { return storageKey; }
    public void setStorageKey(String storageKey) { this.storageKey = storageKey; }

    public String getAlt() { return alt; }
    public void setAlt(String alt) { this.alt = alt; }

    public boolean isPrimary() { return isPrimary; }
    public void setPrimary(boolean primary) { isPrimary = primary; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
}
