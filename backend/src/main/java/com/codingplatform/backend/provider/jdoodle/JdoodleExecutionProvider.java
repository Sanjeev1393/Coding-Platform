package com.codingplatform.backend.provider.jdoodle;

import com.codingplatform.backend.dto.ExecutionRequest;
import com.codingplatform.backend.dto.ExecutionResponse;
import com.codingplatform.backend.dto.ExecutionStatus;
import com.codingplatform.backend.provider.CodeExecutionProvider;
import com.codingplatform.backend.provider.harness.HarnessGenerator;
import com.codingplatform.backend.provider.harness.SourceFile;
import com.codingplatform.backend.provider.jdoodle.dto.JdoodleExecuteRequest;
import com.codingplatform.backend.provider.jdoodle.dto.JdoodleExecuteResponse;
import java.time.Duration;
import java.util.List;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Execution provider connecting to the JDoodle Compiler REST API ({@code /v1/execute}).
 *
 * <p>Activated when {@code execution.provider=jdoodle} in application configuration. Maps JDoodle
 * status codes and execution outcomes into the platform's unified {@link ExecutionResponse} model.
 */
@Component("jdoodleExecutionProvider")
@ConditionalOnProperty(name = "execution.provider", havingValue = "jdoodle")
public class JdoodleExecutionProvider implements CodeExecutionProvider {

    private static final Logger logger = LoggerFactory.getLogger(JdoodleExecutionProvider.class);
    private static final String EXECUTE_ENDPOINT = "/v1/execute";

    private static final Pattern TIMEOUT_PATTERN =
            Pattern.compile(
                    "(?i)\\b(time\\s*limit\\s*exceeded|execution\\s*timed\\s*out|timed?\\s*out)\\b");

    private static final Pattern COMPILATION_ERROR_PATTERN =
            Pattern.compile("(?m)(^.*\\.java:\\d+:\\s*error:|\\berror:\\s+|\\b\\d+\\s+errors?\\b)");

    private static final Pattern RUNTIME_ERROR_PATTERN =
            Pattern.compile(
                    "(?s).*(Exception in thread|Traceback \\(most recent call last\\)|\\bjava\\.lang\\.[A-Za-z]+Exception|\\bjava\\.lang\\.[A-Za-z]+Error).*");

    private final RestClient restClient;
    private final JdoodleProperties properties;
    private final HarnessGenerator harnessGenerator;

    @Autowired
    public JdoodleExecutionProvider(
            JdoodleProperties properties, HarnessGenerator harnessGenerator) {
        this(createRestClient(RestClient.builder(), properties), properties, harnessGenerator);
    }

    public JdoodleExecutionProvider(RestClient restClient, JdoodleProperties properties) {
        this(restClient, properties, new HarnessGenerator());
    }

    public JdoodleExecutionProvider(
            RestClient restClient,
            JdoodleProperties properties,
            HarnessGenerator harnessGenerator) {
        this.restClient = restClient;
        this.properties = properties;
        this.harnessGenerator =
                harnessGenerator != null ? harnessGenerator : new HarnessGenerator();
    }

    private static RestClient createRestClient(
            RestClient.Builder builder, JdoodleProperties properties) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(properties.connectTimeoutMs()));
        requestFactory.setReadTimeout(Duration.ofMillis(properties.readTimeoutMs()));

        return builder.baseUrl(properties.baseUrl()).requestFactory(requestFactory).build();
    }

    /**
     * Executes candidate code using the JDoodle Compiler REST API.
     *
     * <ol>
     *   <li>Validates that credentials exist (without logging secret values).
     *   <li>Resolves the language target and version index for JDoodle.
     *   <li>Synthesizes a test driver harness via {@link HarnessGenerator} if needed.
     *   <li>Dispatches an authenticated HTTP POST request to {@code
     *       https://api.jdoodle.com/v1/execute}.
     *   <li>Maps response fields and handles HTTP/application-level errors.
     * </ol>
     *
     * @param request the execution request containing source code, language, and inputs
     * @return unified {@link ExecutionResponse} with output, metrics, and execution status
     */
    @Override
    public ExecutionResponse execute(ExecutionRequest request) {
        // Validate credentials without logging secret values
        if (properties.clientId().isBlank() || properties.clientSecret().isBlank()) {
            logger.error(
                    "JDoodle credentials missing. Configure JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET.");
            return new ExecutionResponse(
                    ExecutionStatus.INTERNAL_ERROR,
                    "",
                    "Code execution engine credentials are not configured.",
                    "",
                    0,
                    0);
        }

        // Map request language and version index for JDoodle
        JdoodleLanguageTarget target = resolveLanguageTarget(request.language());
        if (target == null) {
            logger.warn("Unsupported language requested for JDoodle: {}", request.language());
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

        // Generate full script with harness driver if algorithmic signature is present
        List<SourceFile> executionFiles = harnessGenerator.generateExecutionFiles(request, "Main");
        String script =
                (executionFiles != null && !executionFiles.isEmpty())
                        ? executionFiles.get(0).content()
                        : request.sourceCode();

        String stdin = request.stdin() != null ? request.stdin() : "";

        JdoodleExecuteRequest jdoodleRequest =
                new JdoodleExecuteRequest(
                        properties.clientId(),
                        properties.clientSecret(),
                        script,
                        stdin,
                        target.language(),
                        target.versionIndex());

        try {
            JdoodleExecuteResponse response =
                    restClient
                            .post()
                            .uri(EXECUTE_ENDPOINT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(jdoodleRequest)
                            .retrieve()
                            .body(JdoodleExecuteResponse.class);

            if (response == null) {
                logger.error("Received empty response body from JDoodle API");
                return new ExecutionResponse(
                        ExecutionStatus.INTERNAL_ERROR,
                        "",
                        "Code execution engine returned an invalid response.",
                        "",
                        0,
                        0);
            }

            return mapJdoodleResponse(response);
        } catch (HttpStatusCodeException ex) {
            int statusCode = ex.getStatusCode().value();
            if (statusCode == 401 || statusCode == 403) {
                logger.warn("JDoodle authentication failed (HTTP {})", statusCode);
                return new ExecutionResponse(
                        ExecutionStatus.INTERNAL_ERROR,
                        "",
                        "Code execution engine authentication failed.",
                        "",
                        0,
                        0);
            }
            if (statusCode == 429 || statusCode == 405) {
                logger.warn("JDoodle quota or rate limit reached (HTTP {})", statusCode);
                return new ExecutionResponse(
                        ExecutionStatus.INTERNAL_ERROR,
                        "",
                        "Code execution engine daily limit reached. Please try again later.",
                        "",
                        0,
                        0);
            }
            if (statusCode == 400) {
                logger.warn("JDoodle rejected request as invalid (HTTP 400)");
                return new ExecutionResponse(
                        ExecutionStatus.INTERNAL_ERROR,
                        "",
                        "Invalid code execution request.",
                        "",
                        0,
                        0);
            }
            logger.error("JDoodle API returned error status {}: {}", statusCode, ex.getMessage());
            return new ExecutionResponse(
                    ExecutionStatus.INTERNAL_ERROR,
                    "",
                    "Code execution engine is currently unavailable.",
                    "",
                    0,
                    0);
        } catch (RestClientException ex) {
            logger.error("Failed to reach JDoodle service: {}", ex.getMessage());
            return new ExecutionResponse(
                    ExecutionStatus.INTERNAL_ERROR,
                    "",
                    "Code execution engine is currently unavailable.",
                    "",
                    0,
                    0);
        }
    }

    private ExecutionResponse mapJdoodleResponse(JdoodleExecuteResponse response) {
        // Handle payload-level HTTP status codes if reported inside the JSON body
        if (response.statusCode() != null) {
            int status = response.statusCode();
            if (status == 401 || status == 403) {
                logger.warn(
                        "JDoodle reported authentication failure in response body (status {})",
                        status);
                return new ExecutionResponse(
                        ExecutionStatus.INTERNAL_ERROR,
                        "",
                        "Code execution engine authentication failed.",
                        "",
                        0,
                        0);
            }
            if (status == 429 || status == 405) {
                logger.warn(
                        "JDoodle reported credit/quota exhaustion in response body (status {})",
                        status);
                return new ExecutionResponse(
                        ExecutionStatus.INTERNAL_ERROR,
                        "",
                        "Code execution engine daily limit reached. Please try again later.",
                        "",
                        0,
                        0);
            }
            if (status == 400) {
                logger.warn("JDoodle reported bad request in response body (status {})", status);
                return new ExecutionResponse(
                        ExecutionStatus.INTERNAL_ERROR,
                        "",
                        "Invalid code execution request.",
                        "",
                        0,
                        0);
            }
            if (status >= 500) {
                logger.error("JDoodle reported server error in response body (status {})", status);
                return new ExecutionResponse(
                        ExecutionStatus.INTERNAL_ERROR,
                        "",
                        "Code execution engine is currently unavailable.",
                        "",
                        0,
                        0);
            }
        }

        // Handle explicit error messages inside the response body
        if (response.error() != null && !response.error().isBlank()) {
            String errorMsg = response.error().toLowerCase();
            if (errorMsg.contains("unauthorized") || errorMsg.contains("invalid client")) {
                return new ExecutionResponse(
                        ExecutionStatus.INTERNAL_ERROR,
                        "",
                        "Code execution engine authentication failed.",
                        "",
                        0,
                        0);
            }
            if (errorMsg.contains("limit")
                    || errorMsg.contains("credit")
                    || errorMsg.contains("balance")) {
                return new ExecutionResponse(
                        ExecutionStatus.INTERNAL_ERROR,
                        "",
                        "Code execution engine daily limit reached. Please try again later.",
                        "",
                        0,
                        0);
            }
            return new ExecutionResponse(
                    ExecutionStatus.INTERNAL_ERROR,
                    "",
                    "Code execution engine returned an error.",
                    "",
                    0,
                    0);
        }

        long executionTimeMs = parseCpuTime(response.cpuTime());
        long memoryKb = parseMemory(response.memory());
        String output = response.output() != null ? response.output() : "";

        // 1. Check for execution timeout
        if (isTimeout(output)) {
            return new ExecutionResponse(
                    ExecutionStatus.TIME_LIMIT_EXCEEDED,
                    "",
                    output.trim(),
                    "",
                    executionTimeMs,
                    memoryKb);
        }

        // 2. Check for compiler error
        if (isCompilationError(output)) {
            return new ExecutionResponse(
                    ExecutionStatus.COMPILATION_ERROR, "", "", output, executionTimeMs, memoryKb);
        }

        // 3. Check for runtime error
        if (isRuntimeError(output)) {
            return new ExecutionResponse(
                    ExecutionStatus.RUNTIME_ERROR, "", output, "", executionTimeMs, memoryKb);
        }

        // 4. Normal successful execution (including empty output)
        return new ExecutionResponse(
                ExecutionStatus.SUCCESS, output, "", "", executionTimeMs, memoryKb);
    }

    private boolean isTimeout(String output) {
        return !output.isBlank() && TIMEOUT_PATTERN.matcher(output).find();
    }

    private boolean isCompilationError(String output) {
        return !output.isBlank() && COMPILATION_ERROR_PATTERN.matcher(output).find();
    }

    private boolean isRuntimeError(String output) {
        return !output.isBlank() && RUNTIME_ERROR_PATTERN.matcher(output).find();
    }

    private long parseCpuTime(String cpuTimeStr) {
        if (cpuTimeStr == null || cpuTimeStr.isBlank()) {
            return 0L;
        }
        try {
            double seconds = Double.parseDouble(cpuTimeStr.trim());
            return Math.max(0L, Math.round(seconds * 1000.0));
        } catch (NumberFormatException e) {
            logger.debug("Unable to parse JDoodle cpuTime '{}'", cpuTimeStr);
            return 0L;
        }
    }

    private long parseMemory(String memoryStr) {
        if (memoryStr == null || memoryStr.isBlank()) {
            return 0L;
        }
        try {
            long kb = Long.parseLong(memoryStr.trim());
            return Math.max(0L, kb);
        } catch (NumberFormatException e) {
            logger.debug("Unable to parse JDoodle memory '{}'", memoryStr);
            return 0L;
        }
    }

    private JdoodleLanguageTarget resolveLanguageTarget(String requestedLanguage) {
        if (requestedLanguage == null) {
            return null;
        }
        String lang = requestedLanguage.trim().toLowerCase();
        return switch (lang) {
            case "java" ->
                    new JdoodleLanguageTarget(
                            properties.defaultLanguage(), properties.defaultVersionIndex());
            case "python" -> new JdoodleLanguageTarget("python3", "4");
            case "javascript" -> new JdoodleLanguageTarget("nodejs", "4");
            default -> null;
        };
    }

    private record JdoodleLanguageTarget(String language, String versionIndex) {}
}
