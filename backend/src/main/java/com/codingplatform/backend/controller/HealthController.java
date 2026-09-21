package com.codingplatform.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Health API", description = "Liveness and readiness health check endpoints")
@RestController
@RequestMapping("/api")
public class HealthController {

    @Operation(
            summary = "Health check",
            description =
                    "Returns the current health status of the service. "
                            + "Used by Render and monitoring systems to determine if the container is alive.")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Service is healthy and running",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema =
                                        @Schema(
                                                example =
                                                        "{\"status\": \"UP\", \"service\": \"coding-platform-backend\"}")))
    })
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "coding-platform-backend");
    }
}
