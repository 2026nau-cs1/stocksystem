package com.stockpulse.backend.config;

import java.util.Optional;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class S3Config {

    @Bean
    Optional<S3Presigner> s3Presigner(Environment environment) {
        String region = environment.getProperty("AWS_REGION");
        String accessKey = environment.getProperty("AWS_ACCESS_KEY_ID");
        String secretKey = environment.getProperty("AWS_SECRET_ACCESS_KEY");

        if (isBlank(region) || isBlank(accessKey) || isBlank(secretKey)) {
            return Optional.empty();
        }

        return Optional.of(
                S3Presigner.builder()
                        .region(Region.of(region))
                        .credentialsProvider(
                                StaticCredentialsProvider.create(
                                        AwsBasicCredentials.create(accessKey, secretKey)
                                )
                        )
                        .build()
        );
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
