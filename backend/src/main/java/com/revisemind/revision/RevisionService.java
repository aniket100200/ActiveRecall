package com.revisemind.revision;

import com.revisemind.common.exception.BadRequestException;
import com.revisemind.common.exception.ResourceNotFoundException;
import com.revisemind.revision.dto.CompleteRevisionRequest;
import com.revisemind.revision.dto.RevisionTaskDto;
import com.revisemind.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.UUID;

@Service
public class RevisionService {

    private final RevisionTaskRepository revisionTaskRepository;
    private final RevisionScheduleService scheduleService;
    private final Clock clock;

    public RevisionService(
        RevisionTaskRepository revisionTaskRepository,
        RevisionScheduleService scheduleService,
        Clock clock
    ) {
        this.revisionTaskRepository = revisionTaskRepository;
        this.scheduleService = scheduleService;
        this.clock = clock;
    }

    public enum QueueType {
        DUE_TODAY,
        OVERDUE,
        UPCOMING,
        COMPLETED
    }

    @Transactional(readOnly = true)
    public Page<RevisionTaskDto> getRevisions(
        User user,
        QueueType queueType,
        UUID subjectId,
        UUID topicId,
        Pageable pageable
    ) {
        ZoneId zone = scheduleService.getUserZoneId(user.getTimeZone());
        ZonedDateTime nowZoned = ZonedDateTime.now(clock).withZoneSameInstant(zone);

        Instant startOfDay = nowZoned.toLocalDate().atStartOfDay(zone).toInstant();
        Instant endOfDay = nowZoned.toLocalDate().plusDays(1).atStartOfDay(zone).toInstant();

        Page<RevisionTask> tasks;
        switch (queueType) {
            case OVERDUE -> tasks = revisionTaskRepository.findOverdue(user.getId(), startOfDay, subjectId, topicId, pageable);
            case UPCOMING -> tasks = revisionTaskRepository.findUpcoming(user.getId(), endOfDay, subjectId, topicId, pageable);
            case COMPLETED -> tasks = revisionTaskRepository.findCompleted(user.getId(), subjectId, topicId, pageable);
            case DUE_TODAY -> tasks = revisionTaskRepository.findDueToday(user.getId(), startOfDay, endOfDay, subjectId, topicId, pageable);
            default -> tasks = revisionTaskRepository.findDueToday(user.getId(), startOfDay, endOfDay, subjectId, topicId, pageable);
        }

        return tasks.map(RevisionTaskDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public RevisionTaskDto getRevisionTask(User user, UUID taskId) {
        RevisionTask task = revisionTaskRepository.findByIdAndStudySessionTopicSubjectUserId(taskId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Revision task not found"));

        return RevisionTaskDto.fromEntity(task);
    }

    @Transactional
    public RevisionTaskDto completeRevisionTask(User user, UUID taskId, CompleteRevisionRequest request) {
        RevisionTask task = revisionTaskRepository.findByIdAndStudySessionTopicSubjectUserId(taskId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Revision task not found"));

        if (task.getStatus() == RevisionStatus.COMPLETED) {
            throw new BadRequestException("This revision task has already been completed.");
        }

        task.setStatus(RevisionStatus.COMPLETED);
        task.setCompletedAt(Instant.now(clock));
        task.setOutcome(request.outcome());
        if (request.reflection() != null) {
            task.setReflection(request.reflection().trim());
        }

        RevisionTask saved = revisionTaskRepository.save(task);
        return RevisionTaskDto.fromEntity(saved);
    }
}
