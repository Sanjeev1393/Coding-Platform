package com.codingplatform.backend.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.codingplatform.backend.controller.HealthController;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(HealthController.class)
@Import(CorsConfig.class)
@TestPropertySource(
        properties = {"cors.allowed-origins=http://localhost:5173,https://my-app.vercel.app"})
class CorsConfigTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private CorsConfig corsConfig;

    @Test
    @DisplayName("Parses comma-separated allowed origins from configuration properties")
    void parsesAllowedOriginsProperly() {
        assertThat(corsConfig.getAllowedOrigins())
                .containsExactly("http://localhost:5173", "https://my-app.vercel.app");
    }

    @Test
    @DisplayName("Pre-flight OPTIONS request succeeds for configured allowed origin")
    void preflightSucceedsForAllowedOrigin() throws Exception {
        mockMvc.perform(
                        options("/api/health")
                                .header("Origin", "https://my-app.vercel.app")
                                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(
                        header().string(
                                        "Access-Control-Allow-Origin",
                                        "https://my-app.vercel.app"));
    }

    @Test
    @DisplayName("Pre-flight OPTIONS request is forbidden for unconfigured origin")
    void preflightFailsForDisallowedOrigin() throws Exception {
        mockMvc.perform(
                        options("/api/health")
                                .header("Origin", "https://unauthorized-domain.com")
                                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }
}
