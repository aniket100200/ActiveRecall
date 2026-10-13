package com.revisemind.history;

import com.revisemind.revision.dto.RevisionTaskDto;
import com.revisemind.study.dto.StudySessionDto;
import com.revisemind.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/history")
public class HistoryController {

    private final HistoryService historyService;

    public HistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping("/revisions")
    public ResponseEntity<Page<RevisionTaskDto>> getCompletedRevisions(
        @AuthenticationPrincipal User currentUser,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(historyService.getCompletedRevisions(currentUser, pageable));
    }

    @GetMapping("/study-sessions")
    public ResponseEntity<Page<StudySessionDto>> getStudySessionsHistory(
        @AuthenticationPrincipal User currentUser,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(historyService.getStudySessionsHistory(currentUser, pageable));
    }
}
