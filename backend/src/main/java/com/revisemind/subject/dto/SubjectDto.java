package com.revisemind.subject.dto;

import com.revisemind.subject.Subject;
import java.time.Instant;
import java.util.UUID;

public record SubjectDto(
    UUID id,
    String name,
    String description,
    boolean archived,
    long topicCount,
    Instant createdAt,
    Instant updatedAt
) {
    public static SubjectDto fromEntity(Subject subject, long topicCount) {
        return new SubjectDto(
            subject.getId(),
            subject.getName(),
            subject.getDescription(),
            subject.isArchived(),
            topicCount,
            subject.getCreatedAt(),
            subject.getUpdatedAt()
        );
    }
}
