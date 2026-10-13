package com.revisemind.history;

import com.revisemind.revision.RevisionTask;
import com.revisemind.revision.RevisionTaskRepository;
import com.revisemind.revision.dto.RevisionTaskDto;
import com.revisemind.study.StudySession;
import com.revisemind.study.StudySessionRepository;
import com.revisemind.study.dto.StudySessionDto;
import com.revisemind.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HistoryService {

    private final RevisionTaskRepository revisionTaskRepository;
    private final StudySessionRepository studySessionRepository;

    public HistoryService(
        RevisionTaskRepository revisionTaskRepository,
        StudySessionRepository studySessionRepository
    ) {
        this.revisionTaskRepository = revisionTaskRepository;
        this.studySessionRepository = studySessionRepository;
    }

    @Transactional(readOnly = true)
    public Page<RevisionTaskDto> getCompletedRevisions(User user, Pageable pageable) {
        Page<RevisionTask> tasks = revisionTaskRepository.findCompleted(user.getId(), null, null, pageable);
        return tasks.map(RevisionTaskDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<StudySessionDto> getStudySessionsHistory(User user, Pageable pageable) {
        Page<StudySession> sessions = studySessionRepository.findByTopicSubjectUserIdOrderByStudiedAtDesc(user.getId(), pageable);

        return sessions.map(session -> {
            List<RevisionTask> tasks = revisionTaskRepository.findByStudySessionIdOrderByScheduleOffsetDaysAsc(session.getId());
            List<RevisionTaskDto> taskDtos = tasks.stream().map(RevisionTaskDto::fromEntity).toList();
            return StudySessionDto.fromEntity(session, taskDtos);
        });
    }
}
