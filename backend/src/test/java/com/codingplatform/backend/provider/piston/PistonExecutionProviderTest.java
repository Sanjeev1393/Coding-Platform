package com.codingplatform.backend.provider.piston;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.codingplatform.backend.dto.ExecutionRequest;
import com.codingplatform.backend.dto.ExecutionResponse;
import com.codingplatform.backend.dto.ExecutionStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

class PistonExecutionProviderTest {

    private static final String PISTON_URL = "http://127.0.0.1:2000/api/v2/execute";

    private MockRestServiceServer mockServer;
    private PistonProperties properties;
    private PistonExecutionProvider provider;

    @BeforeEach
    void setUp() {
        properties =
                new PistonProperties(
                        "http://127.0.0.1:2000", "java", "15.0.2", "Main", 2000, 5000, 3000);

        RestClient.Builder builder = RestClient.builder().baseUrl(properties.baseUrl());
        mockServer = MockRestServiceServer.bindTo(builder).build();
        provider = new PistonExecutionProvider(builder.build(), properties);
    }

    @Test
    void shouldMapSuccessfulExecution() {
        String responseJson =
                """
                {
                    "language": "java",
                    "version": "15.0.2",
                    "run": {
                        "stdout": "Hello, World!\\n",
                        "stderr": "",
                        "output": "Hello, World!\\n",
                        "code": 0,
                        "signal": null,
                        "status": null,
                        "message": null,
                        "memory": 90492000,
                        "cpu_time": 1200,
                        "wall_time": 1350
                    }
                }
                """;

        mockServer
                .expect(requestTo(PISTON_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(jsonPath("$.language").value("java"))
                .andExpect(jsonPath("$.version").value("15.0.2"))
                .andExpect(jsonPath("$.files[0].name").value("Main"))
                .andExpect(jsonPath("$.files[0].content").value("public class Main {}"))
                .andExpect(jsonPath("$.stdin").value("custom-input"))
                .andExpect(jsonPath("$.run_timeout").value(3000))
                .andRespond(withSuccess(responseJson, MediaType.APPLICATION_JSON));

        ExecutionRequest request =
                new ExecutionRequest("java", "public class Main {}", "custom-input");
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.SUCCESS, response.status());
        assertEquals("Hello, World!\n", response.stdout());
        assertEquals("", response.stderr());
        assertEquals("", response.compilationOutput());
        assertEquals(1350, response.executionTimeMs());
        assertEquals(88371, response.memoryKb()); // 90492000 / 1024
        mockServer.verify();
    }

    @Test
    void shouldMapCompilationError() {
        String responseJson =
                """
                {
                    "language": "java",
                    "version": "15.0.2",
                    "run": {
                        "stdout": "",
                        "stderr": "Main.java:1: error: ';' expected\\nerror: compilation failed\\n",
                        "output": "Main.java:1: error: ';' expected\\nerror: compilation failed\\n",
                        "code": 1,
                        "signal": null,
                        "status": "RE",
                        "message": "Exited with error status 1",
                        "memory": 73680000,
                        "cpu_time": 1100,
                        "wall_time": 1400
                    }
                }
                """;

        mockServer
                .expect(requestTo(PISTON_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(responseJson, MediaType.APPLICATION_JSON));

        ExecutionRequest request = new ExecutionRequest("java", "invalid code", null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.COMPILATION_ERROR, response.status());
        assertEquals("", response.stdout());
        assertEquals("", response.stderr());
        assertTrue(response.compilationOutput().contains("error: compilation failed"));
        mockServer.verify();
    }

    @Test
    void shouldMapRuntimeError() {
        String responseJson =
                """
                {
                    "language": "java",
                    "version": "15.0.2",
                    "run": {
                        "stdout": "",
                        "stderr": "Exception in thread \\"main\\" java.lang.ArithmeticException: / by zero\\n\\tat Main.main(Main.java:1)\\n",
                        "output": "Exception in thread \\"main\\" java.lang.ArithmeticException: / by zero\\n\\tat Main.main(Main.java:1)\\n",
                        "code": 1,
                        "signal": null,
                        "status": "RE",
                        "message": "Exited with error status 1",
                        "memory": 85616000,
                        "cpu_time": 1500,
                        "wall_time": 1455
                    }
                }
                """;

        mockServer
                .expect(requestTo(PISTON_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(responseJson, MediaType.APPLICATION_JSON));

        ExecutionRequest request = new ExecutionRequest("java", "public class Main {}", null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.RUNTIME_ERROR, response.status());
        assertEquals("", response.stdout());
        assertEquals("", response.compilationOutput());
        assertTrue(response.stderr().contains("ArithmeticException"));
        mockServer.verify();
    }

    @Test
    void shouldMapTimeout() {
        String responseJson =
                """
                {
                    "language": "java",
                    "version": "15.0.2",
                    "run": {
                        "stdout": "",
                        "stderr": "",
                        "output": "",
                        "code": null,
                        "signal": "SIGKILL",
                        "status": "TO",
                        "message": "Time limit exceeded (wall clock)",
                        "memory": 85652000,
                        "cpu_time": 2976,
                        "wall_time": 3116
                    }
                }
                """;

        mockServer
                .expect(requestTo(PISTON_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(responseJson, MediaType.APPLICATION_JSON));

        ExecutionRequest request = new ExecutionRequest("java", "while(true){}", null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.TIME_LIMIT_EXCEEDED, response.status());
        assertEquals("", response.stdout());
        assertEquals("", response.compilationOutput());
        assertEquals("Time limit exceeded (wall clock)", response.stderr());
        assertEquals(3116, response.executionTimeMs());
        mockServer.verify();
    }

    @Test
    void shouldHandleEmptyStdoutOnSuccess() {
        String responseJson =
                """
                {
                    "language": "java",
                    "version": "15.0.2",
                    "run": {
                        "stdout": "",
                        "stderr": "",
                        "code": 0,
                        "wall_time": 500
                    }
                }
                """;

        mockServer
                .expect(requestTo(PISTON_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(responseJson, MediaType.APPLICATION_JSON));

        ExecutionRequest request = new ExecutionRequest("java", "public class Main {}", null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.SUCCESS, response.status());
        assertEquals("", response.stdout());
        assertEquals("", response.stderr());
        mockServer.verify();
    }

    @Test
    void shouldHandleNullOptionalPistonFields() {
        String responseJson =
                """
                {
                    "language": "java",
                    "version": "15.0.2",
                    "run": {
                        "code": 0
                    }
                }
                """;

        mockServer
                .expect(requestTo(PISTON_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(responseJson, MediaType.APPLICATION_JSON));

        ExecutionRequest request = new ExecutionRequest("java", "public class Main {}", null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.SUCCESS, response.status());
        assertEquals("", response.stdout());
        assertEquals("", response.stderr());
        assertEquals(0, response.executionTimeMs());
        assertEquals(0, response.memoryKb());
        mockServer.verify();
    }

    @Test
    void shouldHandlePistonConnectionFailure() {
        RestClient failingClient =
                RestClient.builder()
                        .baseUrl(properties.baseUrl())
                        .requestFactory(
                                (uri, httpMethod) -> {
                                    throw new ResourceAccessException(
                                            "Connection refused to Piston");
                                })
                        .build();

        PistonExecutionProvider providerWithFailure =
                new PistonExecutionProvider(failingClient, properties);

        ExecutionRequest request = new ExecutionRequest("java", "public class Main {}", null);
        ExecutionResponse response = providerWithFailure.execute(request);

        assertEquals(ExecutionStatus.INTERNAL_ERROR, response.status());
        assertEquals("", response.stdout());
        assertEquals("Code execution engine is currently unavailable.", response.stderr());
        assertEquals(0, response.executionTimeMs());
        assertEquals(0, response.memoryKb());
    }

    @Test
    void shouldHandlePistonNon2xxResponse() {
        mockServer
                .expect(requestTo(PISTON_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withServerError());

        ExecutionRequest request = new ExecutionRequest("java", "public class Main {}", null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.INTERNAL_ERROR, response.status());
        assertEquals("", response.stdout());
        assertEquals("Code execution engine is currently unavailable.", response.stderr());
        mockServer.verify();
    }

    @Test
    void shouldRejectUnsupportedLanguageForPiston() {
        ExecutionRequest request = new ExecutionRequest("python", "print('hello')", null);
        ExecutionResponse response = provider.execute(request);

        assertEquals(ExecutionStatus.INTERNAL_ERROR, response.status());
        assertTrue(response.stderr().contains("Language 'python' is not supported"));
    }
}
