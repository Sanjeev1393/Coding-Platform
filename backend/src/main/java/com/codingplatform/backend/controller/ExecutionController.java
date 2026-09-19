package com.codingplatform.backend.controller;

import com.codingplatform.backend.dto.EvaluationResult;
import com.codingplatform.backend.dto.ExecutionRequest;
import com.codingplatform.backend.dto.ExecutionResponse;
import com.codingplatform.backend.dto.SubmissionRequest;
import com.codingplatform.backend.service.EvaluationService;
import com.codingplatform.backend.service.ExecutionService;
import jakarta.validation.Valid;
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
@RestController
@RequestMapping("/api/v1/executions")
public class ExecutionController {

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
    @PostMapping
    public ResponseEntity<ExecutionResponse> execute(@Valid @RequestBody ExecutionRequest request) {
        ExecutionResponse response = executionService.execute(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Evaluates a solution against the full test suite (visible and hidden) for judging.
     *
     * @param request the submission payload containing question ID, language, and code
     * @return {@link EvaluationResult} with overall verdict and granular test case outcomes
     */
    @PostMapping("/submit")
    public ResponseEntity<EvaluationResult> submit(@Valid @RequestBody SubmissionRequest request) {
        EvaluationResult result = evaluationService.evaluate(request);
        return ResponseEntity.ok(result);
    }
}
