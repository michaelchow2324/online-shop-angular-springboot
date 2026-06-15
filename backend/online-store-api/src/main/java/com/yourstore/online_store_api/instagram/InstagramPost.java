package com.yourstore.online_store_api.instagram;

public record InstagramPost(
        String id,
        String imageUrl,
        String permalink,
        String mediaType,
        String timestamp
) {}
