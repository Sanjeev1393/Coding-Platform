package com.codingplatform.backend.controller;

import com.codingplatform.backend.dto.QuestionResponse;
import com.codingplatform.backend.repository.QuestionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller exposing assessment questions and their visible starter test cases.
 *
 * <p>Endpoints:
 *
 * <ul>
 *   <li>{@code GET /api/v1/questions} - Returns all questions formatted for the candidate
 *       assessment UI.
 *   <li>{@code GET /api/v1/questions/{id}} - Returns a single question definition by ID.
 * </ul>
 *
 * <p>All hidden test cases are strictly filtered out by {@link QuestionResponse} to preserve test
 * integrity.
 */
@Tag(
        name = "Questions API",
        description =
                "Endpoints for browsing coding questions and retrieving problem details with visible test cases")
@RestController
@RequestMapping("/api/v1/questions")
public class QuestionController {

    private final QuestionRepository questionRepository;

    public QuestionController(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    /**
     * Retrieves all available questions for the coding assessment.
     *
     * @return List of safe, client-facing {@link QuestionResponse}
     */
    @Operation(
            summary = "List all questions",
            description =
                    "Returns all available coding problems with their metadata, starter code templates, "
                            + "and visible (non-hidden) test cases. Hidden test cases are strictly filtered out.")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved the list of questions",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                array =
                                        @ArraySchema(
                                                schema =
                                                        @Schema(
                                                                implementation =
                                                                        QuestionResponse.class))))
    })
    @GetMapping
    public ResponseEntity<List<QuestionResponse>> getAllQuestions() {
        List<QuestionResponse> responses =
                questionRepository.findAll().stream().map(QuestionResponse::from).toList();
        return ResponseEntity.ok(responses);
    }

    /**
     * Retrieves a single question by its identifier.
     *
     * @param id question identifier (e.g. {@code "two-sum"})
     * @return {@link QuestionResponse} or 404 Not Found if the question does not exist
     */
    @Operation(
            summary = "Get question by ID",
            description =
                    "Returns full problem details for a single question — including description, "
                            + "function signature, starter codes, and visible test cases. "
                            + "Returns 404 if the question ID does not exist.")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Question found and returned",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = QuestionResponse.class))),
        @ApiResponse(
                responseCode = "404",
                description = "No question found with the given ID",
                content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<QuestionResponse> getQuestionById(
            @Parameter(description = "Question identifier", example = "two-sum") @PathVariable("id")
                    String id) {
        return questionRepository
                .findById(id)
                .map(QuestionResponse::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
