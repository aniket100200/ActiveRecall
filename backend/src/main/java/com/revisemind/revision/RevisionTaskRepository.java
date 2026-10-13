package com.revisemind.revision;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RevisionTaskRepository extends JpaRepository<RevisionTask, UUID> {

    List<RevisionTask> findByStudySessionIdOrderByScheduleOffsetDaysAsc(UUID studySessionId);

    Optional<RevisionTask> findByIdAndStudySessionTopicSubjectUserId(UUID id, UUID userId);

    @Query("""
        SELECT r FROM RevisionTask r
        WHERE r.studySession.topic.subject.user.id = :userId
          AND r.status = 'PENDING'
          AND r.dueAt >= :startOfDay
          AND r.dueAt < :endOfDay
          AND (:subjectId IS NULL OR r.studySession.topic.subject.id = :subjectId)
          AND (:topicId IS NULL OR r.studySession.topic.id = :topicId)
        ORDER BY r.dueAt ASC
    """)
    Page<RevisionTask> findDueToday(
        @Param("userId") UUID userId,
        @Param("startOfDay") Instant startOfDay,
        @Param("endOfDay") Instant endOfDay,
        @Param("subjectId") UUID subjectId,
        @Param("topicId") UUID topicId,
        Pageable pageable
    );

    @Query("""
        SELECT r FROM RevisionTask r
        WHERE r.studySession.topic.subject.user.id = :userId
          AND r.status = 'PENDING'
          AND r.dueAt < :startOfDay
          AND (:subjectId IS NULL OR r.studySession.topic.subject.id = :subjectId)
          AND (:topicId IS NULL OR r.studySession.topic.id = :topicId)
        ORDER BY r.dueAt ASC
    """)
    Page<RevisionTask> findOverdue(
        @Param("userId") UUID userId,
        @Param("startOfDay") Instant startOfDay,
        @Param("subjectId") UUID subjectId,
        @Param("topicId") UUID topicId,
        Pageable pageable
    );

    @Query("""
        SELECT r FROM RevisionTask r
        WHERE r.studySession.topic.subject.user.id = :userId
          AND r.status = 'PENDING'
          AND r.dueAt >= :endOfDay
          AND (:subjectId IS NULL OR r.studySession.topic.subject.id = :subjectId)
          AND (:topicId IS NULL OR r.studySession.topic.id = :topicId)
        ORDER BY r.dueAt ASC
    """)
    Page<RevisionTask> findUpcoming(
        @Param("userId") UUID userId,
        @Param("endOfDay") Instant endOfDay,
        @Param("subjectId") UUID subjectId,
        @Param("topicId") UUID topicId,
        Pageable pageable
    );

    @Query("""
        SELECT r FROM RevisionTask r
        WHERE r.studySession.topic.subject.user.id = :userId
          AND r.status = 'COMPLETED'
          AND (:subjectId IS NULL OR r.studySession.topic.subject.id = :subjectId)
          AND (:topicId IS NULL OR r.studySession.topic.id = :topicId)
        ORDER BY r.completedAt DESC
    """)
    Page<RevisionTask> findCompleted(
        @Param("userId") UUID userId,
        @Param("subjectId") UUID subjectId,
        @Param("topicId") UUID topicId,
        Pageable pageable
    );

    @Query("""
        SELECT r FROM RevisionTask r
        WHERE r.studySession.topic.subject.user.id = :userId
          AND r.status = 'PENDING'
          AND r.dueAt >= :fromInstant
        ORDER BY r.dueAt ASC
    """)
    Page<RevisionTask> findPendingDueFrom(
        @Param("userId") UUID userId,
        @Param("fromInstant") Instant fromInstant,
        Pageable pageable
    );

    @Query("""
        SELECT COUNT(r) FROM RevisionTask r
        WHERE r.studySession.topic.subject.user.id = :userId
          AND r.status = 'PENDING'
          AND r.dueAt >= :startOfDay
          AND r.dueAt < :endOfDay
    """)
    long countDueToday(@Param("userId") UUID userId, @Param("startOfDay") Instant startOfDay, @Param("endOfDay") Instant endOfDay);

    @Query("""
        SELECT COUNT(r) FROM RevisionTask r
        WHERE r.studySession.topic.subject.user.id = :userId
          AND r.status = 'PENDING'
          AND r.dueAt < :startOfDay
    """)
    long countOverdue(@Param("userId") UUID userId, @Param("startOfDay") Instant startOfDay);

    @Query("""
        SELECT COUNT(r) FROM RevisionTask r
        WHERE r.studySession.topic.subject.user.id = :userId
          AND r.status = 'COMPLETED'
          AND r.completedAt >= :startOfDay
          AND r.completedAt < :endOfDay
    """)
    long countCompletedToday(@Param("userId") UUID userId, @Param("startOfDay") Instant startOfDay, @Param("endOfDay") Instant endOfDay);
}
