package com.codingplatform.backend.service;

import com.codingplatform.backend.dto.EvaluationResult;
import com.codingplatform.backend.dto.ExecutionRequest;
import com.codingplatform.backend.dto.ExecutionResponse;
import com.codingplatform.backend.dto.ExecutionStatus;
import com.codingplatform.backend.dto.SubmissionRequest;
import com.codingplatform.backend.dto.TestCaseResult;
import com.codingplatform.backend.model.QuestionDefinition;
import com.codingplatform.backend.model.TestCase;
import com.codingplatform.backend.repository.QuestionRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * EvaluationService acts as the core automated judging engine of the coding platform.
 *
 * <p>Architectural Role & Separation of Concerns:
 *
 * <ul>
 *   <li><b>ExecutionService</b> answers: <i>"Can I execute this snippet of code in the
 *       sandbox?"</i>
 *   <li><b>EvaluationService</b> answers: <i>"Given this candidate code and these test cases, what
 *       is the final verdict?"</i>
 * </ul>
 *
 * <p>Key Responsibilities:
 *
 * <ol>
 *   <li>Loads question test suites (visible and hidden) from {@link QuestionRepository}.
 *   <li>Sequentially runs solution code against each test case using {@link ExecutionService}.
 *   <li><b>Short-circuits</b> on {@code COMPILATION_ERROR} to avoid executing remaining test cases
 *       when syntax fails.
 *   <li>Compares actual execution output against expected values via {@link OutputComparator} to
 *       identify {@code WRONG_ANSWER}.
 *   <li>Protects test integrity by masking inputs and expected outputs for hidden test cases.
 *   <li>Aggregates execution metrics (total runtime, peak memory, passed count) into an {@link
 *       EvaluationResult}.
 * </ol>
 */
@Service
public class EvaluationService {

    private final ExecutionService executionService;
    private final QuestionRepository questionRepository;
    private final OutputComparator outputComparator;

    public EvaluationService(
            ExecutionService executionService,
            QuestionRepository questionRepository,
            OutputComparator outputComparator) {
        this.executionService = executionService;
        this.questionRepository = questionRepository;
        this.outputComparator = outputComparator;
    }

    /**
     * Evaluates a candidate code submission against all test cases associated with the question.
     *
     * @param request the submission payload containing question ID, language, and candidate source
     *     code
     * @return an {@link EvaluationResult} containing the overall verdict, passed/total count,
     *     metrics, and granular test case outcomes
     * @throws IllegalArgumentException if the question ID is not recognized
     */
    public EvaluationResult evaluate(SubmissionRequest request) {
        QuestionDefinition question =
                questionRepository
                        .findById(request.questionId())
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Question not found: " + request.questionId()));

        List<TestCase> testCases = question.testCases();
        if (testCases == null || testCases.isEmpty()) {
            return new EvaluationResult(ExecutionStatus.SUCCESS, 0, 0, 0, 0, null, List.of());
        }

        List<TestCaseResult> caseResults = new ArrayList<>();
        int passedCount = 0;
        long totalExecutionTimeMs = 0;
        long maxMemoryKb = 0;
        ExecutionStatus overallStatus = null;
        String errorMessage = null;

        for (TestCase tc : testCases) {
            ExecutionRequest execRequest =
                    new ExecutionRequest(
                            request.language(),
                            request.sourceCode(),
                            tc.input(),
                            question.signature(),
                            question.sampleInput());

            ExecutionResponse response = executionService.execute(execRequest);
            totalExecutionTimeMs += response.executionTimeMs();
            maxMemoryKb = Math.max(maxMemoryKb, response.memoryKb());

            // Check compilation error - short-circuit since code won't run on any test case
            if (response.status() == ExecutionStatus.COMPILATION_ERROR) {
                caseResults.add(
                        new TestCaseResult(
                                tc.id(),
                                tc.name(),
                                "COMPILATION_ERROR",
                                tc.hidden(),
                                tc.hidden() ? null : tc.input(),
                                tc.hidden() ? null : tc.expectedOutput(),
                                null,
                                response.executionTimeMs()));

                return new EvaluationResult(
                        ExecutionStatus.COMPILATION_ERROR,
                        0,
                        testCases.size(),
                        totalExecutionTimeMs,
                        maxMemoryKb,
                        response.compilationOutput() != null
                                        && !response.compilationOutput().isBlank()
                                ? response.compilationOutput()
                                : "Compilation failed.",
                        caseResults);
            }

            if (response.status() == ExecutionStatus.TIME_LIMIT_EXCEEDED) {
                if (overallStatus == null) {
                    overallStatus = ExecutionStatus.TIME_LIMIT_EXCEEDED;
                    errorMessage = response.stderr();
                }
                caseResults.add(
                        new TestCaseResult(
                                tc.id(),
                                tc.name(),
                                "TIME_LIMIT_EXCEEDED",
                                tc.hidden(),
                                tc.hidden() ? null : tc.input(),
                                tc.hidden() ? null : tc.expectedOutput(),
                                null,
                                response.executionTimeMs()));
                continue;
            }

            if (response.status() == ExecutionStatus.RUNTIME_ERROR) {
                if (overallStatus == null) {
                    overallStatus = ExecutionStatus.RUNTIME_ERROR;
                    errorMessage = response.stderr();
                }
                caseResults.add(
                        new TestCaseResult(
                                tc.id(),
                                tc.name(),
                                "RUNTIME_ERROR",
                                tc.hidden(),
                                tc.hidden() ? null : tc.input(),
                                tc.hidden() ? null : tc.expectedOutput(),
                                tc.hidden() ? null : response.stdout(),
                                response.executionTimeMs()));
                continue;
            }

            if (response.status() == ExecutionStatus.INTERNAL_ERROR) {
                if (overallStatus == null) {
                    overallStatus = ExecutionStatus.INTERNAL_ERROR;
                    errorMessage = response.stderr();
                }
                caseResults.add(
                        new TestCaseResult(
                                tc.id(),
                                tc.name(),
                                "INTERNAL_ERROR",
                                tc.hidden(),
                                tc.hidden() ? null : tc.input(),
                                tc.hidden() ? null : tc.expectedOutput(),
                                null,
                                response.executionTimeMs()));
                continue;
            }

            // SUCCESS execution - validate output
            boolean matched =
                    outputComparator.compare(
                            response.stdout(), tc.expectedOutput(), question.validatorType());

            if (matched) {
                passedCount++;
                caseResults.add(
                        new TestCaseResult(
                                tc.id(),
                                tc.name(),
                                "PASSED",
                                tc.hidden(),
                                tc.hidden() ? null : tc.input(),
                                tc.hidden() ? null : tc.expectedOutput(),
                                tc.hidden() ? null : response.stdout(),
                                response.executionTimeMs()));
            } else {
                if (overallStatus == null) {
                    overallStatus = ExecutionStatus.WRONG_ANSWER;
                }
                caseResults.add(
                        new TestCaseResult(
                                tc.id(),
                                tc.name(),
                                "FAILED",
                                tc.hidden(),
                                tc.hidden() ? null : tc.input(),
                                tc.hidden() ? null : tc.expectedOutput(),
                                tc.hidden() ? null : response.stdout(),
                                response.executionTimeMs()));
            }
        }

        ExecutionStatus finalStatus;
        if (passedCount == testCases.size()) {
            finalStatus = ExecutionStatus.SUCCESS;
        } else if (overallStatus != null) {
            finalStatus = overallStatus;
        } else {
            finalStatus = ExecutionStatus.WRONG_ANSWER;
        }

        return new EvaluationResult(
                finalStatus,
                passedCount,
                testCases.size(),
                totalExecutionTimeMs,
                maxMemoryKb,
                errorMessage,
                caseResults);
    }
}
