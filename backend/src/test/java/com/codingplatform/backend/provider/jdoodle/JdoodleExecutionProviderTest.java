package com.codingplatform.backend.provider.jdoodle;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withBadRequest;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withRawStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withUnauthorizedRequest;

import com.codingplatform.backend.dto.ExecutionRequest;
import com.codingplatform.backend.dto.ExecutionResponse;
import com.codingplatform.backend.dto.ExecutionStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

class JdoodleExecutionProviderTest {

    private static final String JDOODLE_URL = "https://api.jdoodle.com/v1/execute";

    private MockRestServiceServer mockServer;
    private JdoodleProperties properties;
    private JdoodleExecutionProvider provider;

    @BeforeEach
    void setUp() {
        properties =
                new JdoodleProperties(
                        "https://api.jdoodle.com",
                        "test-client-id",
                        "test-client-secret",
                        "java",
                        "4",
                        5000,
                        15000);

        RestClient.Builder builder = RestClient.builder().baseUrl(properties.baseUrl());
        mockServer = MockRestServiceServer.bindTo(builder).build();
        provider = new JdoodleExecutionProvider(builder.build(), properties);
    }

    @Test
    void shouldMapSuccessfulExecution() {
        String responseJson =
                """
                {
                    "output": "Hello from JDoodle!\\n",
                    "statusCode": 200,
                    "memory": "7768",
                    "cpuTime": "0.05"
                }
                """;

        mockServer
                .expect(requestTo(JDOODLE_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(jsonPath("$.clientId").value("test-client-id"))
                .andExpect(jsonPath("$.clientSecret").value("test-client-secret"))
                .andExpect(
                        jsonPath("$.script")
                                .value(
                                        "public class Main { public static void main(String[] args) {} }"))
                .andExpect(jsonPath("$.stdin").value("custom-input"))
                .andExpect(jsonPath("$.language").value("java"))
                .andExpect(jsonPath("$.versionIndex").value("4"))
                .andRespond(withSuccess(responseJson, MediaType.APPLICATION_JSON));

        ExecutionRequest request =
                new ExecutionRequest(
                        "java",
                        "public class Main { public static void main(String[] args) {} }",
                        "custom-input");
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.SUCCESS, response.status());
        assertEquals("Hello from JDoodle!\n", response.stdout());
        assertEquals("", response.stderr());
        assertEquals("", response.compilationOutput());
        assertEquals(50L, response.executionTimeMs()); // 0.05 * 1000
        assertEquals(7768L, response.memoryKb());
        mockServer.verify();
    }

    @Test
    void shouldHandleEmptyStdoutOnSuccess() {
        String responseJson =
                """
                {
                    "output": "",
                    "statusCode": 200,
                    "memory": "3200",
                    "cpuTime": "0.01"
                }
                """;

        mockServer
                .expect(requestTo(JDOODLE_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(responseJson, MediaType.APPLICATION_JSON));

        ExecutionRequest request =
                new ExecutionRequest(
                        "java",
                        "public class Main { public static void main(String[] args) {} }",
                        null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.SUCCESS, response.status());
        assertEquals("", response.stdout());
        assertEquals("", response.stderr());
        assertEquals("", response.compilationOutput());
        assertEquals(10L, response.executionTimeMs());
        assertEquals(3200L, response.memoryKb());
        mockServer.verify();
    }

    @Test
    void shouldMapCompilationError() {
        String responseJson =
                """
                {
                    "output": "/tmp/Main.java:2: error: ';' expected\\n        System.out.println(15)\\n                              ^\\n1 error\\n",
                    "statusCode": 200,
                    "memory": null,
                    "cpuTime": null
                }
                """;

        mockServer
                .expect(requestTo(JDOODLE_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(responseJson, MediaType.APPLICATION_JSON));

        ExecutionRequest request =
                new ExecutionRequest("java", "public class Main { invalid syntax }", null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.COMPILATION_ERROR, response.status());
        assertEquals("", response.stdout());
        assertEquals("", response.stderr());
        assertTrue(response.compilationOutput().contains("error: ';' expected"));
        mockServer.verify();
    }

    @Test
    void shouldMapRuntimeError() {
        String responseJson =
                """
                {
                    "output": "Exception in thread \\"main\\" java.lang.ArithmeticException: / by zero\\n\\tat Main.main(Main.java:3)\\n",
                    "statusCode": 200,
                    "memory": "8120",
                    "cpuTime": "0.04"
                }
                """;

        mockServer
                .expect(requestTo(JDOODLE_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(responseJson, MediaType.APPLICATION_JSON));

        ExecutionRequest request =
                new ExecutionRequest(
                        "java",
                        "public class Main { public static void main(String[] args) { int x = 1 / 0; } }",
                        null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.RUNTIME_ERROR, response.status());
        assertEquals("", response.stdout());
        assertEquals("", response.compilationOutput());
        assertTrue(response.stderr().contains("ArithmeticException"));
        assertEquals(40L, response.executionTimeMs());
        assertEquals(8120L, response.memoryKb());
        mockServer.verify();
    }

    @Test
    void shouldMapTimeout() {
        String responseJson =
                """
                {
                    "output": "Execution Timed Out\\n",
                    "statusCode": 200,
                    "memory": "12000",
                    "cpuTime": "5.00"
                }
                """;

        mockServer
                .expect(requestTo(JDOODLE_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(responseJson, MediaType.APPLICATION_JSON));

        ExecutionRequest request =
                new ExecutionRequest(
                        "java",
                        "public class Main { public static void main(String[] args) { while(true); } }",
                        null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.TIME_LIMIT_EXCEEDED, response.status());
        assertEquals("", response.stdout());
        assertEquals("", response.compilationOutput());
        assertEquals("Execution Timed Out", response.stderr());
        assertEquals(5000L, response.executionTimeMs());
        assertEquals(12000L, response.memoryKb());
        mockServer.verify();
    }

    @Test
    void shouldHandleJdoodle401Unauthorized() {
        mockServer
                .expect(requestTo(JDOODLE_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withUnauthorizedRequest());

        ExecutionRequest request = new ExecutionRequest("java", "public class Main {}", null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.INTERNAL_ERROR, response.status());
        assertEquals("", response.stdout());
        assertEquals("Code execution engine authentication failed.", response.stderr());
        mockServer.verify();
    }

    @Test
    void shouldHandleJdoodle403Forbidden() {
        mockServer
                .expect(requestTo(JDOODLE_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.FORBIDDEN));

        ExecutionRequest request = new ExecutionRequest("java", "public class Main {}", null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.INTERNAL_ERROR, response.status());
        assertEquals("Code execution engine authentication failed.", response.stderr());
        mockServer.verify();
    }

    @Test
    void shouldHandleJdoodle429RateLimitExceeded() {
        mockServer
                .expect(requestTo(JDOODLE_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withRawStatus(429));

        ExecutionRequest request = new ExecutionRequest("java", "public class Main {}", null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.INTERNAL_ERROR, response.status());
        assertEquals(
                "Code execution engine daily limit reached. Please try again later.",
                response.stderr());
        mockServer.verify();
    }

    @Test
    void shouldHandleJdoodle400BadRequest() {
        mockServer
                .expect(requestTo(JDOODLE_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withBadRequest());

        ExecutionRequest request = new ExecutionRequest("java", "public class Main {}", null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.INTERNAL_ERROR, response.status());
        assertEquals("Invalid code execution request.", response.stderr());
        mockServer.verify();
    }

    @Test
    void shouldHandleJdoodle5xxServerError() {
        mockServer
                .expect(requestTo(JDOODLE_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withServerError());

        ExecutionRequest request = new ExecutionRequest("java", "public class Main {}", null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.INTERNAL_ERROR, response.status());
        assertEquals("Code execution engine is currently unavailable.", response.stderr());
        mockServer.verify();
    }

    @Test
    void shouldHandleConnectionFailure() {
        RestClient failingClient =
                RestClient.builder()
                        .baseUrl(properties.baseUrl())
                        .requestFactory(
                                (uri, httpMethod) -> {
                                    throw new ResourceAccessException(
                                            "Connection refused to JDoodle");
                                })
                        .build();

        JdoodleExecutionProvider providerWithFailure =
                new JdoodleExecutionProvider(failingClient, properties);

        ExecutionRequest request = new ExecutionRequest("java", "public class Main {}", null);
        ExecutionResponse response = providerWithFailure.execute(request);

        assertEquals(ExecutionStatus.INTERNAL_ERROR, response.status());
        assertEquals("Code execution engine is currently unavailable.", response.stderr());
    }

    @Test
    void shouldHandlePayloadLevel401Status() {
        String responseJson =
                """
                {
                    "error": "Unauthorized",
                    "statusCode": 401
                }
                """;

        mockServer
                .expect(requestTo(JDOODLE_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(responseJson, MediaType.APPLICATION_JSON));

        ExecutionRequest request = new ExecutionRequest("java", "public class Main {}", null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.INTERNAL_ERROR, response.status());
        assertEquals("Code execution engine authentication failed.", response.stderr());
        mockServer.verify();
    }

    @Test
    void shouldHandlePayloadLevelDailyLimitReached() {
        String responseJson =
                """
                {
                    "error": "Daily limit reached",
                    "statusCode": 429
                }
                """;

        mockServer
                .expect(requestTo(JDOODLE_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(responseJson, MediaType.APPLICATION_JSON));

        ExecutionRequest request = new ExecutionRequest("java", "public class Main {}", null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.INTERNAL_ERROR, response.status());
        assertEquals(
                "Code execution engine daily limit reached. Please try again later.",
                response.stderr());
        mockServer.verify();
    }

    @Test
    void shouldHandleMissingCredentialsGracefully() {
        JdoodleProperties emptyCreds =
                new JdoodleProperties("https://api.jdoodle.com", "", "", "java", "4", 5000, 15000);

        RestClient client = RestClient.builder().baseUrl(emptyCreds.baseUrl()).build();
        JdoodleExecutionProvider unconfiguredProvider =
                new JdoodleExecutionProvider(client, emptyCreds);

        ExecutionRequest request = new ExecutionRequest("java", "public class Main {}", null);
        ExecutionResponse response = unconfiguredProvider.execute(request);

        assertEquals(ExecutionStatus.INTERNAL_ERROR, response.status());
        assertEquals("Code execution engine credentials are not configured.", response.stderr());
    }

    @Test
    void shouldRejectUnsupportedLanguageForJdoodle() {
        ExecutionRequest request = new ExecutionRequest("ruby", "puts 'hello'", null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.INTERNAL_ERROR, response.status());
        assertTrue(response.stderr().contains("Language 'ruby' is not supported"));
    }

    @Test
    void shouldMapPythonExecutionTarget() {
        String responseJson =
                """
                {
                    "output": "Hello Python\\n",
                    "statusCode": 200,
                    "memory": "4000",
                    "cpuTime": "0.02"
                }
                """;

        mockServer
                .expect(requestTo(JDOODLE_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(jsonPath("$.language").value("python3"))
                .andExpect(jsonPath("$.versionIndex").value("4"))
                .andRespond(withSuccess(responseJson, MediaType.APPLICATION_JSON));

        ExecutionRequest request = new ExecutionRequest("python", "print('Hello Python')", null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.SUCCESS, response.status());
        assertEquals("Hello Python\n", response.stdout());
        mockServer.verify();
    }
}
