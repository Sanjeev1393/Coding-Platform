package com.codingplatform.backend.provider.piston.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record PistonExecuteRequest(
        String language,
        String version,
        List<PistonFile> files,
        String stdin,
        @JsonProperty("run_timeout") Integer runTimeout) {}
