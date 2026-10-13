package com.revisemind.revision.dto;

import com.revisemind.revision.RevisionOutcome;
import com.revisemind.revision.RevisionStatus;
import com.revisemind.revision.RevisionTask;

import java.time.Instant;
import java.util.UUID;

public record RevisionTaskDto(
    UUID id,
    UUID studySessionId,
    String sessionTitle,
    String sessionNotes,
    UUID topicId,
    String topicName,
    UUID subjectId,
    String subjectName,
    int scheduleOffsetDays,
    Instant dueAt,
    RevisionStatus status,
    Instant completedAt,
    RevisionOutcome outcome,
    String reflection,
    Instant createdAt
) {
    public static RevisionTaskDto fromEntity(RevisionTask task) {
        var session = task.getStudySession();
        var topic = session.getTopic();
        var subject = topic.getSubject();

        return new RevisionTaskDto(
            task.getId(),
            session.getId(),
            session.getTitle(),
            session.getNotes(),
            topic.getId(),
            topic.getName(),
            subject.getId(),
            subject.getName(),
            task.getScheduleOffsetDays(),
            task.getDueAt(),
            task.getStatus(),
            task.getCompletedAt(),
            task.getOutcome(),
            task.getReflection(),
            task.getCreatedAt()
        );
    }
}
