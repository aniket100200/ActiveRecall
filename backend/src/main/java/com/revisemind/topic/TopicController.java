package com.revisemind.topic;

import com.revisemind.topic.dto.CreateTopicRequest;
import com.revisemind.topic.dto.TopicDto;
import com.revisemind.topic.dto.UpdateTopicRequest;
import com.revisemind.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class TopicController {

    private final TopicService topicService;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    @GetMapping("/subjects/{subjectId}/topics")
    public ResponseEntity<List<TopicDto>> getTopicsBySubject(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID subjectId,
        @RequestParam(defaultValue = "false") boolean includeArchived
    ) {
        return ResponseEntity.ok(topicService.getTopics(currentUser, subjectId, includeArchived));
    }

    @PostMapping("/subjects/{subjectId}/topics")
    public ResponseEntity<TopicDto> createTopic(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID subjectId,
        @Valid @RequestBody CreateTopicRequest request
    ) {
        TopicDto topic = topicService.createTopic(currentUser, subjectId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(topic);
    }

    @GetMapping("/topics/{topicId}")
    public ResponseEntity<TopicDto> getTopic(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID topicId
    ) {
        return ResponseEntity.ok(topicService.getTopic(currentUser, topicId));
    }

    @PutMapping("/topics/{topicId}")
    public ResponseEntity<TopicDto> updateTopic(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID topicId,
        @Valid @RequestBody UpdateTopicRequest request
    ) {
        return ResponseEntity.ok(topicService.updateTopic(currentUser, topicId, request));
    }

    @DeleteMapping("/topics/{topicId}")
    public ResponseEntity<Void> archiveTopic(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID topicId
    ) {
        topicService.archiveTopic(currentUser, topicId);
        return ResponseEntity.noContent().build();
    }
}
