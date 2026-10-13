package com.revisemind.settings.dto;

import java.time.Instant;
import java.util.List;

public record RevisionSettingsDto(
    List<Integer> scheduleOffsetsDays,
    Instant updatedAt
) {
}
