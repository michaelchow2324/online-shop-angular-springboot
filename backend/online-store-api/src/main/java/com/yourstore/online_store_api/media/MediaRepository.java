package com.yourstore.online_store_api.media;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for `Media` rows. Used to look up storage keys for entities.
 */
public interface MediaRepository extends JpaRepository<Media, Long> {

    List<Media> findByEntityTypeAndEntityIdOrderByPrimaryDescIdAsc(String entityType, Long entityId);
}
