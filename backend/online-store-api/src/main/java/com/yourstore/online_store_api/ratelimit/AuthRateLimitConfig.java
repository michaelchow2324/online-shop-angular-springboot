package com.yourstore.online_store_api.ratelimit;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(AuthRateLimitProperties.class)
public class AuthRateLimitConfig {
}
