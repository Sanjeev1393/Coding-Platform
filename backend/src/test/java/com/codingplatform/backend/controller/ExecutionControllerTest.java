package com.codingplatform.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.codingplatform.backend.dto.ExecutionResponse;
import com.codingplatform.backend.dto.ExecutionStatus;
import com.codingplatform.backend.service.ExecutionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ExecutionController.class)
class ExecutionControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private ExecutionService executionService;

    @Test
    void shouldReturnSuccessfulExecutionResponse() throws Exception {
        ExecutionResponse response =
                new ExecutionResponse(
                        ExecutionStatus.SUCCESS, "Mock execution completed", "", "", 15, 2048);

        when(executionService.execute(any())).thenReturn(response);

        mockMvc.perform(
                        post("/api/v1/executions")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "language": "java",
                                          "sourceCode": "public class Main {}",
                                          "stdin": "1 2"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.stdout").value("Mock execution completed"))
                .andExpect(jsonPath("$.executionTimeMs").value(15))
                .andExpect(jsonPath("$.memoryKb").value(2048));
    }

    @Test
    void shouldRejectBlankLanguageAndSourceCode() throws Exception {
        mockMvc.perform(
                        post("/api/v1/executions")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "language": "",
                                          "sourceCode": "",
                                          "stdin": ""
                                        }
                                        """))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(executionService);
    }

    @Test
    void shouldRejectUnsupportedLanguage() throws Exception {
        mockMvc.perform(
                        post("/api/v1/executions")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "language": "cpp",
                                          "sourceCode": "some code",
                                          "stdin": ""
                                        }
                                        """))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(executionService);
    }
}
