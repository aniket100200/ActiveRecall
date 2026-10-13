package com.revisemind.topic;

import com.revisemind.common.exception.ResourceNotFoundException;
import com.revisemind.subject.Subject;
import com.revisemind.subject.SubjectRepository;
import com.revisemind.topic.dto.CreateTopicRequest;
import com.revisemind.topic.dto.TopicDto;
import com.revisemind.topic.dto.UpdateTopicRequest;
import com.revisemind.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TopicService {

    private final TopicRepository topicRepository;
    private final SubjectRepository subjectRepository;

    public TopicService(TopicRepository topicRepository, SubjectRepository subjectRepository) {
        this.topicRepository = topicRepository;
        this.subjectRepository = subjectRepository;
    }

    @Transactional(readOnly = true)
    public List<TopicDto> getTopics(User user, UUID subjectId, boolean includeArchived) {
        // Enforce user ownership of subject
        Subject subject = subjectRepository.findByIdAndUserId(subjectId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        List<Topic> topics = includeArchived
            ? topicRepository.findBySubjectIdOrderByNameAsc(subject.getId())
            : topicRepository.findBySubjectIdAndArchivedOrderByNameAsc(subject.getId(), false);

        return topics.stream().map(TopicDto::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public TopicDto getTopic(User user, UUID topicId) {
        Topic topic = topicRepository.findByIdAndSubjectUserId(topicId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));

        return TopicDto.fromEntity(topic);
    }

    @Transactional
    public TopicDto createTopic(User user, UUID subjectId, CreateTopicRequest request) {
        Subject subject = subjectRepository.findByIdAndUserId(subjectId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        Topic topic = new Topic(
            UUID.randomUUID(),
            subject,
            request.name().trim(),
            request.description() != null ? request.description().trim() : null
        );

        Topic saved = topicRepository.save(topic);
        return TopicDto.fromEntity(saved);
    }

    @Transactional
    public TopicDto updateTopic(User user, UUID topicId, UpdateTopicRequest request) {
        Topic topic = topicRepository.findByIdAndSubjectUserId(topicId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));

        topic.setName(request.name().trim());
        if (request.description() != null) {
            topic.setDescription(request.description().trim());
        }
        if (request.archived() != null) {
            topic.setArchived(request.archived());
        }

        Topic updated = topicRepository.save(topic);
        return TopicDto.fromEntity(updated);
    }

    @Transactional
    public void archiveTopic(User user, UUID topicId) {
        Topic topic = topicRepository.findByIdAndSubjectUserId(topicId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));

        topic.setArchived(true);
        topicRepository.save(topic);
    }
}
