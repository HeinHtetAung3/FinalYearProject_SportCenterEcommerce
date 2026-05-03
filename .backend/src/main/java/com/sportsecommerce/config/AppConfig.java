package com.sportsecommerce.config;

import com.sportsecommerce.security.JwtProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.cache.annotation.EnableCaching;

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
@EnableCaching
public class AppConfig {
}
