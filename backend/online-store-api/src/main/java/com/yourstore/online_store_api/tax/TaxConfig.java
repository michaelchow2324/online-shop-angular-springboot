package com.yourstore.online_store_api.tax;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(TaxProperties.class)
public class TaxConfig {
}
