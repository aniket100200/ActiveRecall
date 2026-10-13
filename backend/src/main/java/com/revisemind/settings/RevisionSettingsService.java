package com.revisemind.settings;

import com.revisemind.revision.RevisionScheduleService;
import com.revisemind.settings.dto.RevisionSettingsDto;
import com.revisemind.settings.dto.UpdateRevisionScheduleRequest;
import com.revisemind.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RevisionSettingsService {

    private final UserRevisionSettingsRepository settingsRepository;
    private final RevisionScheduleService scheduleService;

    public RevisionSettingsService(
        UserRevisionSettingsRepository settingsRepository,
        RevisionScheduleService scheduleService
    ) {
        this.settingsRepository = settingsRepository;
        this.scheduleService = scheduleService;
    }

    @Transactional(readOnly = true)
    public RevisionSettingsDto getSettings(User user) {
        UserRevisionSettings settings = settingsRepository.findById(user.getId())
            .orElseGet(() -> new UserRevisionSettings(user, "0,3,7,14,21"));

        return new RevisionSettingsDto(settings.getOffsetsList(), settings.getUpdatedAt());
    }

    @Transactional
    public RevisionSettingsDto updateSchedule(User user, UpdateRevisionScheduleRequest request) {
        List<Integer> offsets = request.offsetsDays();
        scheduleService.validateOffsets(offsets);

        UserRevisionSettings settings = settingsRepository.findById(user.getId())
            .orElseGet(() -> new UserRevisionSettings(user, "0,3,7,14,21"));

        settings.setOffsetsList(offsets);
        UserRevisionSettings saved = settingsRepository.save(settings);

        return new RevisionSettingsDto(saved.getOffsetsList(), saved.getUpdatedAt());
    }
}
