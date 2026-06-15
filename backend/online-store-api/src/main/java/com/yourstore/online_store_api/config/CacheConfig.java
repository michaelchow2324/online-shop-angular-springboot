package com.yourstore.online_store_api.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableCaching
@EnableScheduling
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("instagram-feed");
    }

    /** Evict the Instagram cache every hour so fresh posts are picked up. */
    @Scheduled(fixedRate = 3_600_000)
    public void evictInstagramCache() {
        cacheManager().getCache("instagram-feed").clear();
    }
}
