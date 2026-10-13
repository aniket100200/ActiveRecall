package com.revisemind.dashboard;

import com.revisemind.dashboard.dto.DashboardSummaryDto;
import com.revisemind.revision.RevisionScheduleService;
import com.revisemind.revision.RevisionTask;
import com.revisemind.revision.RevisionTaskRepository;
import com.revisemind.revision.dto.RevisionTaskDto;
import com.revisemind.study.StudySessionRepository;
import com.revisemind.subject.SubjectRepository;
import com.revisemind.user.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

@Service
public class DashboardService {

    private final RevisionTaskRepository revisionTaskRepository;
    private final StudySessionRepository studySessionRepository;
    private final SubjectRepository subjectRepository;
    private final RevisionScheduleService scheduleService;
    private final Clock clock;

    public DashboardService(
        RevisionTaskRepository revisionTaskRepository,
        StudySessionRepository studySessionRepository,
        SubjectRepository subjectRepository,
        RevisionScheduleService scheduleService,
        Clock clock
    ) {
        this.revisionTaskRepository = revisionTaskRepository;
        this.studySessionRepository = studySessionRepository;
        this.subjectRepository = subjectRepository;
        this.scheduleService = scheduleService;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getSummary(User user) {
        ZoneId zone = scheduleService.getUserZoneId(user.getTimeZone());
        ZonedDateTime nowZoned = ZonedDateTime.now(clock).withZoneSameInstant(zone);

        Instant startOfDay = nowZoned.toLocalDate().atStartOfDay(zone).toInstant();
        Instant endOfDay = nowZoned.toLocalDate().plusDays(1).atStartOfDay(zone).toInstant();

        long dueToday = revisionTaskRepository.countDueToday(user.getId(), startOfDay, endOfDay);
        long overdue = revisionTaskRepository.countOverdue(user.getId(), startOfDay);
        long completedToday = revisionTaskRepository.countCompletedToday(user.getId(), startOfDay, endOfDay);
        long totalSessions = studySessionRepository.countByUserId(user.getId());
        long activeSubjects = subjectRepository.countActiveByUserId(user.getId());

        long denominator = dueToday + completedToday;
        double rate = (denominator > 0) ? Math.round(((double) completedToday / denominator) * 1000.0) / 10.0 : 0.0;

        return new DashboardSummaryDto(dueToday, overdue, completedToday, totalSessions, activeSubjects, rate);
    }

    @Transactional(readOnly = true)
    public List<RevisionTaskDto> getUpcomingRevisions(User user, int limit) {
        ZoneId zone = scheduleService.getUserZoneId(user.getTimeZone());
        ZonedDateTime nowZoned = ZonedDateTime.now(clock).withZoneSameInstant(zone);
        Instant startOfToday = nowZoned.toLocalDate().atStartOfDay(zone).toInstant();

        // Upcoming or due today pending tasks
        var tasks = revisionTaskRepository.findPendingDueFrom(user.getId(), startOfToday, PageRequest.of(0, limit));
        return tasks.getContent().stream().map(RevisionTaskDto::fromEntity).toList();
    }
}
