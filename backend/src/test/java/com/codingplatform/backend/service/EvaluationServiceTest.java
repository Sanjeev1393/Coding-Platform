package com.codingplatform.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.codingplatform.backend.dto.EvaluationResult;
import com.codingplatform.backend.dto.ExecutionRequest;
import com.codingplatform.backend.dto.ExecutionResponse;
import com.codingplatform.backend.dto.ExecutionStatus;
import com.codingplatform.backend.dto.FunctionSignature;
import com.codingplatform.backend.dto.SubmissionRequest;
import com.codingplatform.backend.model.QuestionDefinition;
import com.codingplatform.backend.model.TestCase;
import com.codingplatform.backend.repository.QuestionRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Unit tests for {@link EvaluationService} testing test suite execution, short-circuiting on
 * compilation failure, output verification, hidden test case masking, and error handling.
 */
class EvaluationServiceTest {

    private ExecutionService executionService;
    private QuestionRepository questionRepository;
    private OutputComparator outputComparator;
    private EvaluationService evaluationService;

    private QuestionDefinition dummyQuestion;

    @BeforeEach
    void setUp() {
        executionService = mock(ExecutionService.class);
        questionRepository = mock(QuestionRepository.class);
        outputComparator = new OutputComparator();
        evaluationService =
                new EvaluationService(executionService, questionRepository, outputComparator);

        dummyQuestion =
                new QuestionDefinition(
                        "dummy-q",
                        "Dummy Question",
                        new FunctionSignature("solve", List.of(), "int[]"),
                        "sample input",
                        "exact",
                        List.of(
                                new TestCase("tc-1", "Case 1", "in1", "[0, 1]", false),
                                new TestCase("tc-2", "Case 2 (Hidden)", "in2", "[1, 2]", true)));
    }

    @Test
    void shouldReturnSuccessWhenAllTestCasesPass() {
        when(questionRepository.findById("dummy-q")).thenReturn(Optional.of(dummyQuestion));

        ExecutionResponse res1 =
                new ExecutionResponse(ExecutionStatus.SUCCESS, "[0, 1]", "", "", 10, 1024);
        ExecutionResponse res2 =
                new ExecutionResponse(ExecutionStatus.SUCCESS, "[1, 2]", "", "", 15, 2048);

        when(executionService.execute(any(ExecutionRequest.class)))
                .thenReturn(res1)
                .thenReturn(res2);

        SubmissionRequest request = new SubmissionRequest("dummy-q", "java", "class Solution {}");
        EvaluationResult result = evaluationService.evaluate(request);

        assertEquals(ExecutionStatus.SUCCESS, result.status());
        assertEquals(2, result.passed());
        assertEquals(2, result.total());
        assertEquals(25, result.totalExecutionTimeMs());
        assertEquals(2048, result.maxMemoryKb());
        assertNull(result.errorMessage());
        assertEquals(2, result.testCases().size());
        assertEquals("PASSED", result.testCases().get(0).status());
        assertEquals("PASSED", result.testCases().get(1).status());

        // Verify hidden test case masks inputs & outputs
        assertNotNull(result.testCases().get(0).input());
        assertNotNull(result.testCases().get(0).expectedOutput());
        assertTrue(result.testCases().get(1).hidden());
        assertNull(result.testCases().get(1).input());
        assertNull(result.testCases().get(1).expectedOutput());
    }

    @Test
    void shouldReturnWrongAnswerWhenOutputDiffers() {
        when(questionRepository.findById("dummy-q")).thenReturn(Optional.of(dummyQuestion));

        ExecutionResponse res1 =
                new ExecutionResponse(ExecutionStatus.SUCCESS, "[0, 1]", "", "", 10, 1024);
        ExecutionResponse res2 =
                new ExecutionResponse(ExecutionStatus.SUCCESS, "[9, 9]", "", "", 15, 2048);

        when(executionService.execute(any(ExecutionRequest.class)))
                .thenReturn(res1)
                .thenReturn(res2);

        SubmissionRequest request = new SubmissionRequest("dummy-q", "java", "class Solution {}");
        EvaluationResult result = evaluationService.evaluate(request);

        assertEquals(ExecutionStatus.WRONG_ANSWER, result.status());
        assertEquals(1, result.passed());
        assertEquals(2, result.total());
        assertEquals("PASSED", result.testCases().get(0).status());
        assertEquals("FAILED", result.testCases().get(1).status());
    }

    @Test
    void shouldShortCircuitOnCompilationError() {
        when(questionRepository.findById("dummy-q")).thenReturn(Optional.of(dummyQuestion));

        ExecutionResponse compileError =
                new ExecutionResponse(
                        ExecutionStatus.COMPILATION_ERROR,
                        "",
                        "",
                        "Cannot find symbol Solution",
                        5,
                        512);

        when(executionService.execute(any(ExecutionRequest.class))).thenReturn(compileError);

        SubmissionRequest request = new SubmissionRequest("dummy-q", "java", "broken code");
        EvaluationResult result = evaluationService.evaluate(request);

        assertEquals(ExecutionStatus.COMPILATION_ERROR, result.status());
        assertEquals(0, result.passed());
        assertEquals(2, result.total());
        assertEquals("Cannot find symbol Solution", result.errorMessage());
        // Only 1 execution should have happened before short-circuit
        verify(executionService, times(1)).execute(any(ExecutionRequest.class));
    }

    @Test
    void shouldReturnRuntimeErrorWhenExecutionThrows() {
        when(questionRepository.findById("dummy-q")).thenReturn(Optional.of(dummyQuestion));

        ExecutionResponse re =
                new ExecutionResponse(
                        ExecutionStatus.RUNTIME_ERROR,
                        "",
                        "java.lang.ArrayIndexOutOfBoundsException",
                        "",
                        12,
                        1024);

        when(executionService.execute(any(ExecutionRequest.class))).thenReturn(re);

        SubmissionRequest request = new SubmissionRequest("dummy-q", "java", "class Solution {}");
        EvaluationResult result = evaluationService.evaluate(request);

        assertEquals(ExecutionStatus.RUNTIME_ERROR, result.status());
        assertEquals(0, result.passed());
        assertEquals("RUNTIME_ERROR", result.testCases().get(0).status());
        assertEquals("java.lang.ArrayIndexOutOfBoundsException", result.errorMessage());
    }

    @Test
    void shouldThrowWhenQuestionNotFound() {
        when(questionRepository.findById("unknown")).thenReturn(Optional.empty());

        SubmissionRequest request = new SubmissionRequest("unknown", "java", "class Solution {}");
        assertThrows(IllegalArgumentException.class, () -> evaluationService.evaluate(request));
    }
}
