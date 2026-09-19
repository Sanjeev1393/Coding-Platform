package com.codingplatform.backend.controller;

import com.codingplatform.backend.dto.QuestionResponse;
import com.codingplatform.backend.repository.QuestionRepository;
import java.util.List;
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
    @GetMapping("/{id}")
    public ResponseEntity<QuestionResponse> getQuestionById(@PathVariable("id") String id) {
        return questionRepository
                .findById(id)
                .map(QuestionResponse::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
