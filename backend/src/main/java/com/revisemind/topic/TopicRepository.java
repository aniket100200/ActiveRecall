package com.revisemind.topic;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TopicRepository extends JpaRepository<Topic, UUID> {

    List<Topic> findBySubjectIdAndArchivedOrderByNameAsc(UUID subjectId, boolean archived);

    List<Topic> findBySubjectIdOrderByNameAsc(UUID subjectId);

    Optional<Topic> findByIdAndSubjectUserId(UUID id, UUID userId);

    @Query("SELECT COUNT(t) FROM Topic t WHERE t.subject.id = :subjectId AND t.archived = false")
    long countActiveBySubjectId(@Param("subjectId") UUID subjectId);
}
