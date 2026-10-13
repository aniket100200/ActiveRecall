package com.revisemind.topic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateTopicRequest(
    @NotBlank(message = "Topic name must not be blank")
    @Size(max = 160, message = "Topic name must not exceed 160 characters")
    String name,

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    String description,

    Boolean archived
) {
}
