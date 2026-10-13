package com.revisemind.revision.dto;

import com.revisemind.revision.RevisionOutcome;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CompleteRevisionRequest(
    @NotNull(message = "Outcome must be specified (AGAIN, HARD, GOOD, EASY)")
    RevisionOutcome outcome,

    @Size(max = 2000, message = "Reflection must not exceed 2000 characters")
    String reflection
) {
}
