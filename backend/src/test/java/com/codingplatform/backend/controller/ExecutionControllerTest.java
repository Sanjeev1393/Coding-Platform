package com.codingplatform.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.codingplatform.backend.dto.EvaluationResult;
import com.codingplatform.backend.dto.ExecutionResponse;
import com.codingplatform.backend.dto.ExecutionStatus;
import com.codingplatform.backend.dto.TestCaseResult;
import com.codingplatform.backend.service.EvaluationService;
import com.codingplatform.backend.service.ExecutionService;
import java.util.List;
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
    @MockitoBean private EvaluationService evaluationService;

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

    @Test
    void shouldReturnEvaluationResultOnSubmit() throws Exception {
        EvaluationResult evaluationResult =
                new EvaluationResult(
                        ExecutionStatus.SUCCESS,
                        2,
                        2,
                        30,
                        2048,
                        null,
                        List.of(
                                new TestCaseResult(
                                        "c-1",
                                        "Example 1",
                                        "PASSED",
                                        false,
                                        "in",
                                        "out",
                                        "out",
                                        15),
                                new TestCaseResult(
                                        "c-2", "Example 2", "PASSED", true, null, null, null, 15)));

        when(evaluationService.evaluate(any())).thenReturn(evaluationResult);

        mockMvc.perform(
                        post("/api/v1/executions/submit")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "questionId": "two-sum",
                                          "language": "java",
                                          "sourceCode": "class Solution {}"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.passed").value(2))
                .andExpect(jsonPath("$.total").value(2))
                .andExpect(jsonPath("$.testCases[0].status").value("PASSED"))
                .andExpect(jsonPath("$.testCases[1].hidden").value(true));
    }

    @Test
    void shouldRejectSubmitWithMissingQuestionId() throws Exception {
        mockMvc.perform(
                        post("/api/v1/executions/submit")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "questionId": "",
                                          "language": "java",
                                          "sourceCode": "class Solution {}"
                                        }
                                        """))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(evaluationService);
    }
}
