package com.revisemind.study;

import com.revisemind.study.dto.CreateStudySessionRequest;
import com.revisemind.study.dto.StudySessionDto;
import com.revisemind.user.User;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class StudySessionController {

    private final StudySessionService studySessionService;

    public StudySessionController(StudySessionService studySessionService) {
        this.studySessionService = studySessionService;
    }

    @PostMapping("/topics/{topicId}/sessions")
    public ResponseEntity<StudySessionDto> createStudySession(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID topicId,
        @Valid @RequestBody CreateStudySessionRequest request
    ) {
        StudySessionDto dto = studySessionService.createStudySession(currentUser, topicId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/topics/{topicId}/sessions")
    public ResponseEntity<Page<StudySessionDto>> getSessionsForTopic(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID topicId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(studySessionService.getSessionsForTopic(currentUser, topicId, pageable));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<StudySessionDto> getSession(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID sessionId
    ) {
        return ResponseEntity.ok(studySessionService.getSession(currentUser, sessionId));
    }
}
