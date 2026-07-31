package com.yourstore.online_store_api.shipping;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration 
@EnableConfigurationProperties(ShippingProperties.class) 
public class ShippingConfig {
}
/**
 * 
 * Annotation	                              Role
----------------------------------------------------------
@Configuration :            Marks a source of bean definitions (a config class Spring processes)
@EnableConfigurationProperties(ShippingProperties.class) :Registers ShippingProperties as a bean and turns on binding for it ShippingConfig
@ConfigurationProperties(prefix = "app.shipping") :Tells Spring which YAML/properties keys to copy into that bean’s fields 
 */
