package com.revisemind.settings.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record UpdateRevisionScheduleRequest(
    @NotEmpty(message = "Schedule offsets must not be empty")
    List<Integer> offsetsDays
) {
}
