package com.revisemind.revision;

import com.revisemind.revision.dto.CompleteRevisionRequest;
import com.revisemind.revision.dto.RevisionTaskDto;
import com.revisemind.user.User;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/revisions")
public class RevisionController {

    private final RevisionService revisionService;

    public RevisionController(RevisionService revisionService) {
        this.revisionService = revisionService;
    }

    @GetMapping
    public ResponseEntity<Page<RevisionTaskDto>> getRevisions(
        @AuthenticationPrincipal User currentUser,
        @RequestParam(defaultValue = "DUE_TODAY") RevisionService.QueueType status,
        @RequestParam(required = false) UUID subjectId,
        @RequestParam(required = false) UUID topicId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<RevisionTaskDto> result = revisionService.getRevisions(currentUser, status, subjectId, topicId, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<RevisionTaskDto> getRevisionTask(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID taskId
    ) {
        return ResponseEntity.ok(revisionService.getRevisionTask(currentUser, taskId));
    }

    @PostMapping("/{taskId}/complete")
    public ResponseEntity<RevisionTaskDto> completeRevisionTask(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID taskId,
        @Valid @RequestBody CompleteRevisionRequest request
    ) {
        RevisionTaskDto completed = revisionService.completeRevisionTask(currentUser, taskId, request);
        return ResponseEntity.ok(completed);
    }
}
