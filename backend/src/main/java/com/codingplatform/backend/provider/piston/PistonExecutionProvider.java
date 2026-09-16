package com.codingplatform.backend.provider.piston;

import com.codingplatform.backend.dto.ExecutionRequest;
import com.codingplatform.backend.dto.ExecutionResponse;
import com.codingplatform.backend.dto.ExecutionStatus;
import com.codingplatform.backend.provider.CodeExecutionProvider;
import com.codingplatform.backend.provider.piston.dto.PistonExecuteRequest;
import com.codingplatform.backend.provider.piston.dto.PistonExecuteResponse;
import com.codingplatform.backend.provider.piston.dto.PistonFile;
import com.codingplatform.backend.provider.piston.dto.PistonStageResult;
import java.time.Duration;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class PistonExecutionProvider implements CodeExecutionProvider {

    private static final Logger logger = LoggerFactory.getLogger(PistonExecutionProvider.class);
    private static final String EXECUTE_ENDPOINT = "/api/v2/execute";
    private static final String COMPILATION_FAILED_MARKER = "error: compilation failed";

    private final RestClient restClient;
    private final PistonProperties properties;

    @Autowired
    public PistonExecutionProvider(PistonProperties properties) {
        this(createRestClient(RestClient.builder(), properties), properties);
    }

    public PistonExecutionProvider(RestClient restClient, PistonProperties properties) {
        this.restClient = restClient;
        this.properties = properties;
    }

    private static RestClient createRestClient(
            RestClient.Builder builder, PistonProperties properties) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(properties.connectTimeoutMs()));
        requestFactory.setReadTimeout(Duration.ofMillis(properties.readTimeoutMs()));

        return builder.baseUrl(properties.baseUrl()).requestFactory(requestFactory).build();
    }

    @Override
    public ExecutionResponse execute(ExecutionRequest request) {
        if (!properties.language().equalsIgnoreCase(request.language())) {
            logger.warn("Unsupported language requested for execution: {}", request.language());
            return new ExecutionResponse(
                    ExecutionStatus.INTERNAL_ERROR,
                    "",
                    "Language '"
                            + request.language()
                            + "' is not supported by this execution provider.",
                    "",
                    0,
                    0);
        }

        String stdin = request.stdin() != null ? request.stdin() : "";
        PistonExecuteRequest pistonRequest =
                new PistonExecuteRequest(
                        properties.language(),
                        properties.version(),
                        List.of(new PistonFile(properties.fileName(), request.sourceCode())),
                        stdin,
                        properties.runTimeoutMs());

        try {
            PistonExecuteResponse response =
                    restClient
                            .post()
                            .uri(EXECUTE_ENDPOINT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(pistonRequest)
                            .retrieve()
                            .body(PistonExecuteResponse.class);

            if (response == null || response.run() == null) {
                logger.error("Received empty or malformed response from Piston");
                return new ExecutionResponse(
                        ExecutionStatus.INTERNAL_ERROR,
                        "",
                        "Code execution engine returned an invalid response.",
                        "",
                        0,
                        0);
            }

            return mapPistonResponse(response);
        } catch (RestClientException ex) {
            logger.error("Failed to execute code via Piston service: {}", ex.getMessage(), ex);
            return new ExecutionResponse(
                    ExecutionStatus.INTERNAL_ERROR,
                    "",
                    "Code execution engine is currently unavailable.",
                    "",
                    0,
                    0);
        }
    }

    private ExecutionResponse mapPistonResponse(PistonExecuteResponse response) {
        PistonStageResult run = response.run();
        PistonStageResult compile = response.compile();

        long executionTimeMs = run.wallTime() != null ? Math.max(0, run.wallTime()) : 0L;
        long memoryKb = run.memory() != null ? Math.max(0, run.memory() / 1024L) : 0L;

        // Check for compilation error (compile stage failure or single-stage run RE with
        // compilation failed marker)
        if (isCompilationError(run, compile)) {
            String compilationDetail =
                    compile != null && hasError(compile)
                            ? extractErrorDetail(compile, "Compilation failed.")
                            : extractErrorDetail(run, "Compilation failed.");

            return new ExecutionResponse(
                    ExecutionStatus.COMPILATION_ERROR,
                    "",
                    "",
                    compilationDetail,
                    executionTimeMs,
                    memoryKb);
        }

        // Check for timeout
        if (isTimeout(run)) {
            String timeoutDetail = extractErrorDetail(run, "Execution timed out.");
            return new ExecutionResponse(
                    ExecutionStatus.TIME_LIMIT_EXCEEDED,
                    "",
                    timeoutDetail,
                    "",
                    executionTimeMs,
                    memoryKb);
        }

        // Check for successful execution
        if (run.code() != null && run.code() == 0 && !"RE".equalsIgnoreCase(run.status())) {
            String stdout = run.stdout() != null ? run.stdout() : "";
            return new ExecutionResponse(
                    ExecutionStatus.SUCCESS, stdout, "", "", executionTimeMs, memoryKb);
        }

        // Other non-zero exit code or runtime error (RE)
        String runtimeDetail = extractErrorDetail(run, "Runtime error occurred during execution.");
        String stdout = run.stdout() != null ? run.stdout() : "";
        return new ExecutionResponse(
                ExecutionStatus.RUNTIME_ERROR,
                stdout,
                runtimeDetail,
                "",
                executionTimeMs,
                memoryKb);
    }

    private boolean isCompilationError(PistonStageResult run, PistonStageResult compile) {
        if (compile != null && compile.code() != null && compile.code() != 0) {
            return true;
        }
        if (run != null && "RE".equalsIgnoreCase(run.status())) {
            String stderr = run.stderr();
            return stderr != null && stderr.contains(COMPILATION_FAILED_MARKER);
        }
        return false;
    }

    private boolean isTimeout(PistonStageResult run) {
        if (run == null) {
            return false;
        }
        return "TO".equalsIgnoreCase(run.status()) || "SIGKILL".equalsIgnoreCase(run.signal());
    }

    private boolean hasError(PistonStageResult stage) {
        return (stage.code() != null && stage.code() != 0)
                || (stage.stderr() != null && !stage.stderr().isBlank());
    }

    private String extractErrorDetail(PistonStageResult stage, String fallback) {
        if (stage == null) {
            return fallback;
        }
        if (stage.stderr() != null && !stage.stderr().isBlank()) {
            return stage.stderr();
        }
        if (stage.output() != null && !stage.output().isBlank()) {
            return stage.output();
        }
        if (stage.message() != null && !stage.message().isBlank()) {
            return stage.message();
        }
        return fallback;
    }
}
