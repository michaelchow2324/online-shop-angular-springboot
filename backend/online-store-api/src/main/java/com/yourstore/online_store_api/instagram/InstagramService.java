package com.yourstore.online_store_api.instagram;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class InstagramService {

    private static final Logger log = LoggerFactory.getLogger(InstagramService.class);
    private static final String GRAPH_API = "https://graph.instagram.com/v21.0";
    private static final String FIELDS = "id,media_url,thumbnail_url,permalink,media_type,timestamp";

    @Value("${instagram.access-token:}")
    private String accessToken;

    private final RestClient restClient = RestClient.create();

    /**
     * Returns the 7 most recent Instagram posts.
     * Result is cached for 1 hour (see CacheConfig).
     */
    @Cacheable("instagram-feed")
    public List<InstagramPost> getLatestPosts() {
        if (accessToken == null || accessToken.isBlank()) {
            throw new IllegalStateException("instagram.access-token is not configured");
        }

        var response = restClient.get()
                .uri(GRAPH_API + "/me/media?fields=" + FIELDS + "&limit=7&access_token=" + accessToken)
                .retrieve()
                .body(Map.class);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");

        return data.stream()
                .map(item -> new InstagramPost(
                        (String) item.get("id"),
                        resolveImageUrl(item),
                        (String) item.get("permalink"),
                        (String) item.get("media_type"),
                        (String) item.get("timestamp")
                ))
                .toList();
    }

    /**
     * Refreshes the long-lived access token every 50 days.
     * Meta tokens expire after 60 days; refreshing at 50 days gives a 10-day safety buffer.
     * A refreshed token is valid for another 60 days from the refresh date.
     * No redeploy or restart needed — the new token is held in memory.
     */
    @Scheduled(fixedRate = 50L * 24 * 60 * 60 * 1000) // 50 days in ms
    @CacheEvict(value = "instagram-feed", allEntries = true)
    public void refreshAccessToken() {
        if (accessToken == null || accessToken.isBlank()) {
            log.warn("Instagram token refresh skipped: no token configured");
            return;
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.get()
                    .uri(GRAPH_API + "/refresh_access_token"
                            + "?grant_type=ig_refresh_token"
                            + "&access_token=" + accessToken)
                    .retrieve()
                    .body(Map.class);

            accessToken = (String) response.get("access_token");
            log.info("Instagram access token refreshed successfully");
        } catch (Exception e) {
            log.error("Failed to refresh Instagram access token: {}", e.getMessage());
            // Keep using the old token until it actually expires
        }
    }

    /** For VIDEO posts the media_url is the video itself; use thumbnail_url as the still image. */
    private String resolveImageUrl(Map<String, Object> item) {
        String type = (String) item.get("media_type");
        if ("VIDEO".equals(type) && item.get("thumbnail_url") != null) {
            return (String) item.get("thumbnail_url");
        }
        return (String) item.get("media_url");
    }
}
