package com.revisemind.topic.dto;

import com.revisemind.topic.Topic;
import java.time.Instant;
import java.util.UUID;

public record TopicDto(
    UUID id,
    UUID subjectId,
    String subjectName,
    String name,
    String description,
    boolean archived,
    Instant createdAt,
    Instant updatedAt
) {
    public static TopicDto fromEntity(Topic topic) {
        return new TopicDto(
            topic.getId(),
            topic.getSubject().getId(),
            topic.getSubject().getName(),
            topic.getName(),
            topic.getDescription(),
            topic.isArchived(),
            topic.getCreatedAt(),
            topic.getUpdatedAt()
        );
    }
}
