package com.revisemind.common.exception;

import java.time.Instant;
import java.util.Map;

public record ErrorResponse(
    Instant timestamp,
    int status,
    String code,
    String message,
    Map<String, String> fieldErrors,
    String path
) {
    public ErrorResponse(int status, String code, String message, Map<String, String> fieldErrors, String path) {
        this(Instant.now(), status, code, message, fieldErrors, path);
    }

    public ErrorResponse(int status, String code, String message, String path) {
        this(Instant.now(), status, code, message, null, path);
    }
}
