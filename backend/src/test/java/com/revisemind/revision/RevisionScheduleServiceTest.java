package com.revisemind.revision;

import com.revisemind.common.exception.BadRequestException;
import com.revisemind.settings.UserRevisionSettingsRepository;
import com.revisemind.study.StudySession;
import com.revisemind.subject.Subject;
import com.revisemind.topic.Topic;
import com.revisemind.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class RevisionScheduleServiceTest {

    private UserRevisionSettingsRepository settingsRepository;
    private RevisionScheduleService scheduleService;

    @BeforeEach
    void setUp() {
        settingsRepository = Mockito.mock(UserRevisionSettingsRepository.class);
        scheduleService = new RevisionScheduleService(settingsRepository);
    }

    @Test
    void validateOffsets_throwsException_onInvalidInputs() {
        assertThrows(BadRequestException.class, () -> scheduleService.validateOffsets(null));
        assertThrows(BadRequestException.class, () -> scheduleService.validateOffsets(List.of()));
        assertThrows(BadRequestException.class, () -> scheduleService.validateOffsets(List.of(-1, 3, 7)));
        assertThrows(BadRequestException.class, () -> scheduleService.validateOffsets(List.of(0, 7, 3)));
        assertThrows(BadRequestException.class, () -> scheduleService.validateOffsets(List.of(0, 3, 3, 7)));
    }

    @Test
    void generateRevisionTasks_calculatesCorrectDueDateForDefaultOffsets() {
        User user = new User(UUID.randomUUID(), "Test", "test@example.com", "hash", "Asia/Kolkata");
        when(settingsRepository.findById(user.getId())).thenReturn(Optional.empty());

        Subject subject = new Subject(UUID.randomUUID(), user, "Math", "Desc");
        Topic topic = new Topic(UUID.randomUUID(), subject, "Algebra", "Desc");

        // Studied at 2026-10-13T10:00:00Z
        Instant studiedAt = Instant.parse("2026-10-13T10:00:00Z");
        StudySession session = new StudySession(UUID.randomUUID(), topic, "Session 1", "Notes", studiedAt, 30);

        List<RevisionTask> tasks = scheduleService.generateRevisionTasks(session, user);

        assertEquals(5, tasks.size());

        // Offset 0: exactly studiedAt
        assertEquals(0, tasks.get(0).getScheduleOffsetDays());
        assertEquals(studiedAt, tasks.get(0).getDueAt());

        // Offset 3: +3 calendar days in Asia/Kolkata
        ZoneId zone = ZoneId.of("Asia/Kolkata");
        ZonedDateTime expected3Days = studiedAt.atZone(zone).plusDays(3);
        assertEquals(3, tasks.get(1).getScheduleOffsetDays());
        assertEquals(expected3Days.toInstant(), tasks.get(1).getDueAt());

        // Offset 7: +7 calendar days
        ZonedDateTime expected7Days = studiedAt.atZone(zone).plusDays(7);
        assertEquals(7, tasks.get(2).getScheduleOffsetDays());
        assertEquals(expected7Days.toInstant(), tasks.get(2).getDueAt());

        // Offset 14: +14 calendar days
        ZonedDateTime expected14Days = studiedAt.atZone(zone).plusDays(14);
        assertEquals(14, tasks.get(3).getScheduleOffsetDays());
        assertEquals(expected14Days.toInstant(), tasks.get(3).getDueAt());

        // Offset 21: +21 calendar days
        ZonedDateTime expected21Days = studiedAt.atZone(zone).plusDays(21);
        assertEquals(21, tasks.get(4).getScheduleOffsetDays());
        assertEquals(expected21Days.toInstant(), tasks.get(4).getDueAt());
    }
}
