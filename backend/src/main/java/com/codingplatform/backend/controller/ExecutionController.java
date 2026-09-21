package com.codingplatform.backend.controller;

import com.codingplatform.backend.dto.EvaluationResult;
import com.codingplatform.backend.dto.ExecutionRequest;
import com.codingplatform.backend.dto.ExecutionResponse;
import com.codingplatform.backend.dto.SubmissionRequest;
import com.codingplatform.backend.service.EvaluationService;
import com.codingplatform.backend.service.ExecutionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller handling code execution experimentation and automated submission judging.
 *
 * <p>Endpoints:
 *
 * <ul>
 *   <li>{@code POST /api/v1/executions} - "Run Code": Executes solution against a single visible or
 *       custom input.
 *   <li>{@code POST /api/v1/executions/submit} - "Submit Solution": Evaluates solution against
 *       visible and hidden test suites.
 * </ul>
 */
@Tag(
        name = "Execution API",
        description =
                "Endpoints for running code against a single input and submitting solutions for full judging")
@RestController
@RequestMapping("/api/v1/executions")
public class ExecutionController {

    private static final Logger logger = LoggerFactory.getLogger(ExecutionController.class);

    private final ExecutionService executionService;
    private final EvaluationService evaluationService;

    public ExecutionController(
            ExecutionService executionService, EvaluationService evaluationService) {
        this.executionService = executionService;
        this.evaluationService = evaluationService;
    }

    /**
     * Executes user code against a single input or visible test case for experimentation.
     *
     * @param request the single execution request
     * @return {@link ExecutionResponse} with stdout, stderr, and execution metrics
     */
    @Operation(
            summary = "Run Code",
            description =
                    """
                    Executes user-submitted code against a single input for experimentation (the **Run** button).

                    **Note:** Execution errors like `COMPILATION_ERROR`, `RUNTIME_ERROR`, and `TIME_LIMIT_EXCEEDED`
                    are returned with HTTP `200 OK` — the HTTP call itself succeeded; the domain-level outcome
                    is encoded in the `status` field of the response body.
                    """)
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description =
                        "Execution completed (check `status` field for domain outcome — SUCCESS, COMPILATION_ERROR, RUNTIME_ERROR, etc.)",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = ExecutionResponse.class))),
        @ApiResponse(
                responseCode = "400",
                description =
                        "Invalid request payload — language is blank/unsupported, or sourceCode is blank",
                content = @Content)
    })
    @PostMapping
    public ResponseEntity<ExecutionResponse> execute(@Valid @RequestBody ExecutionRequest request) {
        logger.info("Received execution request: language={}", request.language());
        try {
            ExecutionResponse response = executionService.execute(request);
            logger.info(
                    "Execution completed: status={}, timeMs={}, memoryKb={}",
                    response.status(),
                    response.executionTimeMs(),
                    response.memoryKb());
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            logger.error("Unexpected error during code execution: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    /**
     * Evaluates a solution against the full test suite (visible and hidden) for judging.
     *
     * @param request the submission payload containing question ID, language, and code
     * @return {@link EvaluationResult} with overall verdict and granular test case outcomes
     */
    @Operation(
            summary = "Submit Solution",
            description =
                    """
                    Evaluates a candidate's solution against the **full test suite** (visible + hidden) for automated judging.

                    **Anti-Cheating Design:** When a test case has `hidden: true`, the fields `input`, `expectedOutput`,
                    and `actualOutput` are deliberately set to `null` in the response — the candidate can see
                    pass/fail but not the actual hidden test data.
                    """)
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description =
                        "Submission evaluated (check `status` field — SUCCESS, WRONG_ANSWER, COMPILATION_ERROR, etc.)",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = EvaluationResult.class))),
        @ApiResponse(
                responseCode = "400",
                description =
                        "Invalid request payload — questionId, language, or sourceCode is missing/invalid",
                content = @Content),
        @ApiResponse(
                responseCode = "404",
                description = "Question not found for the provided questionId",
                content = @Content)
    })
    @PostMapping("/submit")
    public ResponseEntity<EvaluationResult> submit(@Valid @RequestBody SubmissionRequest request) {
        logger.info(
                "Received submission request: questionId={}, language={}",
                request.questionId(),
                request.language());
        try {
            EvaluationResult result = evaluationService.evaluate(request);
            logger.info(
                    "Submission evaluated: status={}, passed={}/{}, totalTimeMs={}",
                    result.status(),
                    result.passed(),
                    result.total(),
                    result.totalExecutionTimeMs());
            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            logger.error(
                    "Unexpected error during solution evaluation for question '{}': {}",
                    request.questionId(),
                    ex.getMessage(),
                    ex);
            throw ex;
        }
    }
}
