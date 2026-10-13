package com.revisemind.subject.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSubjectRequest(
    @NotBlank(message = "Subject name must not be blank")
    @Size(max = 120, message = "Subject name must not exceed 120 characters")
    String name,

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    String description
) {
}
