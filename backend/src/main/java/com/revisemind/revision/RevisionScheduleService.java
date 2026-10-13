package com.revisemind.revision;

import com.revisemind.common.exception.BadRequestException;
import com.revisemind.settings.UserRevisionSettings;
import com.revisemind.settings.UserRevisionSettingsRepository;
import com.revisemind.study.StudySession;
import com.revisemind.user.User;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class RevisionScheduleService {

    private final UserRevisionSettingsRepository settingsRepository;

    public RevisionScheduleService(UserRevisionSettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    public List<Integer> getUserScheduleOffsets(User user) {
        return settingsRepository.findById(user.getId())
            .map(UserRevisionSettings::getOffsetsList)
            .orElseGet(() -> List.of(0, 3, 7, 14, 21));
    }

    public void validateOffsets(List<Integer> offsets) {
        if (offsets == null || offsets.isEmpty()) {
            throw new BadRequestException("Schedule offsets list must not be empty.");
        }

        int previous = -1;
        for (Integer offset : offsets) {
            if (offset == null || offset < 0) {
                throw new BadRequestException("Schedule offset days must be non-negative integers.");
            }
            if (offset <= previous) {
                throw new BadRequestException("Schedule offsets must be unique and strictly ascending.");
            }
            previous = offset;
        }
    }

    public List<RevisionTask> generateRevisionTasks(StudySession session, User user) {
        List<Integer> offsets = getUserScheduleOffsets(user);
        validateOffsets(offsets);

        ZoneId userZone = getUserZoneId(user.getTimeZone());
        Instant studiedAtInstant = session.getStudiedAt();
        ZonedDateTime studiedAtZoned = studiedAtInstant.atZone(userZone);

        List<RevisionTask> tasks = new ArrayList<>();
        for (int offsetDays : offsets) {
            ZonedDateTime dueZoned;
            if (offsetDays == 0) {
                dueZoned = studiedAtZoned;
            } else {
                dueZoned = studiedAtZoned.plusDays(offsetDays);
            }

            Instant dueAt = dueZoned.toInstant();
            tasks.add(new RevisionTask(UUID.randomUUID(), session, offsetDays, dueAt));
        }

        return tasks;
    }

    public ZoneId getUserZoneId(String timeZoneStr) {
        if (timeZoneStr == null || timeZoneStr.isBlank()) {
            return ZoneId.of("Asia/Kolkata");
        }
        try {
            return ZoneId.of(timeZoneStr.trim());
        } catch (DateTimeException e) {
            return ZoneId.of("Asia/Kolkata");
        }
    }
}
