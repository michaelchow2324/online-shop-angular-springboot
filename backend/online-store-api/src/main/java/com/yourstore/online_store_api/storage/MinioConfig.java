package com.yourstore.online_store_api.storage;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

    // These values can be set in application.properties or application.yml
    @Value("${storage.minio.endpoint:}")
    private String endpoint;

    @Value("${storage.minio.access-key:}")
    private String accessKey;

    @Value("${storage.minio.secret-key:}")
    private String secretKey;

    // Bean: creats MinioClient at startup if endpoint is configured, otherwise returns null
    // singleton by default, so it will be shared across the application
    // Ready to be injected into other components
    @Bean
    public MinioClient minioClient() {
        if (endpoint == null || endpoint.isBlank()) return null;
        return MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    }
}
