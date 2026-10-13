package com.revisemind.study;

import com.revisemind.common.exception.ResourceNotFoundException;
import com.revisemind.revision.RevisionScheduleService;
import com.revisemind.revision.RevisionTask;
import com.revisemind.revision.RevisionTaskRepository;
import com.revisemind.revision.dto.RevisionTaskDto;
import com.revisemind.study.dto.CreateStudySessionRequest;
import com.revisemind.study.dto.StudySessionDto;
import com.revisemind.topic.Topic;
import com.revisemind.topic.TopicRepository;
import com.revisemind.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class StudySessionService {

    private final StudySessionRepository studySessionRepository;
    private final TopicRepository topicRepository;
    private final RevisionTaskRepository revisionTaskRepository;
    private final RevisionScheduleService revisionScheduleService;

    public StudySessionService(
        StudySessionRepository studySessionRepository,
        TopicRepository topicRepository,
        RevisionTaskRepository revisionTaskRepository,
        RevisionScheduleService revisionScheduleService
    ) {
        this.studySessionRepository = studySessionRepository;
        this.topicRepository = topicRepository;
        this.revisionTaskRepository = revisionTaskRepository;
        this.revisionScheduleService = revisionScheduleService;
    }

    @Transactional
    public StudySessionDto createStudySession(User user, UUID topicId, CreateStudySessionRequest request) {
        Topic topic = topicRepository.findByIdAndSubjectUserId(topicId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));

        Instant studiedAt = request.studiedAt() != null ? request.studiedAt() : Instant.now();

        StudySession session = new StudySession(
            UUID.randomUUID(),
            topic,
            request.title() != null ? request.title().trim() : null,
            request.notes() != null ? request.notes().trim() : null,
            studiedAt,
            request.durationMinutes()
        );

        StudySession savedSession = studySessionRepository.save(session);

        // Generate revision tasks transactionally
        List<RevisionTask> tasks = revisionScheduleService.generateRevisionTasks(savedSession, user);
        List<RevisionTask> savedTasks = revisionTaskRepository.saveAll(tasks);

        List<RevisionTaskDto> taskDtos = savedTasks.stream()
            .map(RevisionTaskDto::fromEntity)
            .toList();

        return StudySessionDto.fromEntity(savedSession, taskDtos);
    }

    @Transactional(readOnly = true)
    public Page<StudySessionDto> getSessionsForTopic(User user, UUID topicId, Pageable pageable) {
        // Enforce user ownership of parent subject/topic
        topicRepository.findByIdAndSubjectUserId(topicId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));

        Page<StudySession> sessions = studySessionRepository.findByTopicIdAndTopicSubjectUserIdOrderByStudiedAtDesc(topicId, user.getId(), pageable);

        return sessions.map(session -> {
            List<RevisionTask> tasks = revisionTaskRepository.findByStudySessionIdOrderByScheduleOffsetDaysAsc(session.getId());
            List<RevisionTaskDto> taskDtos = tasks.stream().map(RevisionTaskDto::fromEntity).toList();
            return StudySessionDto.fromEntity(session, taskDtos);
        });
    }

    @Transactional(readOnly = true)
    public StudySessionDto getSession(User user, UUID sessionId) {
        StudySession session = studySessionRepository.findByIdAndTopicSubjectUserId(sessionId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Study session not found"));

        List<RevisionTask> tasks = revisionTaskRepository.findByStudySessionIdOrderByScheduleOffsetDaysAsc(session.getId());
        List<RevisionTaskDto> taskDtos = tasks.stream().map(RevisionTaskDto::fromEntity).toList();

        return StudySessionDto.fromEntity(session, taskDtos);
    }
}
