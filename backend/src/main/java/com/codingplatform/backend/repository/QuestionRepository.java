package com.codingplatform.backend.repository;

import com.codingplatform.backend.model.QuestionDefinition;
import java.util.List;
import java.util.Optional;

/**
 * QuestionRepository defines the data access contract for retrieving programming question metadata,
 * function signatures, and test cases.
 *
 * <p>Currently uses an in-memory implementation ({@link InMemoryQuestionRepository}).
 *
 * <p>TODO: Transition this repository contract from in-memory storage to a persistent relational
 * database (PostgreSQL).
 */
public interface QuestionRepository {

    /**
     * Finds a question definition and its test suite by its unique identifier.
     *
     * @param id the unique question ID (e.g. {@code "two-sum"})
     * @return an Optional containing the question definition if found, or empty otherwise
     */
    Optional<QuestionDefinition> findById(String id);

    /**
     * Returns all registered question definitions.
     *
     * @return an unmodifiable list of all questions
     */
    List<QuestionDefinition> findAll();
}
