package com.lagiism.shared;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI lagiismOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("LAGIISM Backend API")
                        .description("Modular Monolith REST API for LAGIISM Storefront & Admin Portal")
                        .version("1.0.0"));
    }
}
