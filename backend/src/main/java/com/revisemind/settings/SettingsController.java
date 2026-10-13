package com.revisemind.settings;

import com.revisemind.settings.dto.RevisionSettingsDto;
import com.revisemind.settings.dto.UpdateRevisionScheduleRequest;
import com.revisemind.user.User;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings")
public class SettingsController {

    private final RevisionSettingsService revisionSettingsService;

    public SettingsController(RevisionSettingsService revisionSettingsService) {
        this.revisionSettingsService = revisionSettingsService;
    }

    @GetMapping("/revision-schedule")
    public ResponseEntity<RevisionSettingsDto> getRevisionSchedule(
        @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(revisionSettingsService.getSettings(currentUser));
    }

    @PutMapping("/revision-schedule")
    public ResponseEntity<RevisionSettingsDto> updateRevisionSchedule(
        @AuthenticationPrincipal User currentUser,
        @Valid @RequestBody UpdateRevisionScheduleRequest request
    ) {
        return ResponseEntity.ok(revisionSettingsService.updateSchedule(currentUser, request));
    }
}
