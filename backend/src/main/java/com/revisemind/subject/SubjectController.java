package com.revisemind.subject;

import com.revisemind.subject.dto.CreateSubjectRequest;
import com.revisemind.subject.dto.SubjectDto;
import com.revisemind.subject.dto.UpdateSubjectRequest;
import com.revisemind.user.User;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping
    public ResponseEntity<Page<SubjectDto>> getSubjects(
        @AuthenticationPrincipal User currentUser,
        @RequestParam(defaultValue = "false") boolean includeArchived,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return ResponseEntity.ok(subjectService.getSubjects(currentUser, includeArchived, pageable));
    }

    @GetMapping("/{subjectId}")
    public ResponseEntity<SubjectDto> getSubject(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID subjectId
    ) {
        return ResponseEntity.ok(subjectService.getSubject(currentUser, subjectId));
    }

    @PostMapping
    public ResponseEntity<SubjectDto> createSubject(
        @AuthenticationPrincipal User currentUser,
        @Valid @RequestBody CreateSubjectRequest request
    ) {
        SubjectDto subject = subjectService.createSubject(currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(subject);
    }

    @PutMapping("/{subjectId}")
    public ResponseEntity<SubjectDto> updateSubject(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID subjectId,
        @Valid @RequestBody UpdateSubjectRequest request
    ) {
        return ResponseEntity.ok(subjectService.updateSubject(currentUser, subjectId, request));
    }

    @DeleteMapping("/{subjectId}")
    public ResponseEntity<Void> archiveSubject(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID subjectId
    ) {
        subjectService.archiveSubject(currentUser, subjectId);
        return ResponseEntity.noContent().build();
    }
}
