package com.revisemind.study.dto;

import com.revisemind.revision.dto.RevisionTaskDto;
import com.revisemind.study.StudySession;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record StudySessionDto(
    UUID id,
    UUID topicId,
    String topicName,
    UUID subjectId,
    String subjectName,
    String title,
    String notes,
    Instant studiedAt,
    Integer durationMinutes,
    List<RevisionTaskDto> revisionTasks,
    Instant createdAt
) {
    public static StudySessionDto fromEntity(StudySession session, List<RevisionTaskDto> tasks) {
        var topic = session.getTopic();
        var subject = topic.getSubject();

        return new StudySessionDto(
            session.getId(),
            topic.getId(),
            topic.getName(),
            subject.getId(),
            subject.getName(),
            session.getTitle(),
            session.getNotes(),
            session.getStudiedAt(),
            session.getDurationMinutes(),
            tasks,
            session.getCreatedAt()
        );
    }
}
