package com.revisemind.study;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface StudySessionRepository extends JpaRepository<StudySession, UUID> {

    Page<StudySession> findByTopicIdAndTopicSubjectUserIdOrderByStudiedAtDesc(UUID topicId, UUID userId, Pageable pageable);

    Page<StudySession> findByTopicSubjectUserIdOrderByStudiedAtDesc(UUID userId, Pageable pageable);

    Optional<StudySession> findByIdAndTopicSubjectUserId(UUID id, UUID userId);

    @Query("SELECT COUNT(s) FROM StudySession s WHERE s.topic.subject.user.id = :userId")
    long countByUserId(@Param("userId") UUID userId);
}
