package com.revisemind.study.dto;

import jakarta.validation.constraints.Min;

import java.time.Instant;

public record CreateStudySessionRequest(
    String title,
    String notes,
    Instant studiedAt,

    @Min(value = 0, message = "Duration must be a positive number of minutes")
    Integer durationMinutes
) {
}
