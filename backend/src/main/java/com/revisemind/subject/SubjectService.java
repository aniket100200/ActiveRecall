package com.revisemind.subject;

import com.revisemind.common.exception.ResourceNotFoundException;
import com.revisemind.subject.dto.CreateSubjectRequest;
import com.revisemind.subject.dto.SubjectDto;
import com.revisemind.subject.dto.UpdateSubjectRequest;
import com.revisemind.topic.TopicRepository;
import com.revisemind.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;

    public SubjectService(SubjectRepository subjectRepository, TopicRepository topicRepository) {
        this.subjectRepository = subjectRepository;
        this.topicRepository = topicRepository;
    }

    @Transactional(readOnly = true)
    public Page<SubjectDto> getSubjects(User user, boolean includeArchived, Pageable pageable) {
        Page<Subject> subjects = includeArchived
            ? subjectRepository.findByUserId(user.getId(), pageable)
            : subjectRepository.findByUserIdAndArchived(user.getId(), false, pageable);

        return subjects.map(subject -> {
            long count = topicRepository.countActiveBySubjectId(subject.getId());
            return SubjectDto.fromEntity(subject, count);
        });
    }

    @Transactional(readOnly = true)
    public SubjectDto getSubject(User user, UUID subjectId) {
        Subject subject = subjectRepository.findByIdAndUserId(subjectId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        long count = topicRepository.countActiveBySubjectId(subject.getId());
        return SubjectDto.fromEntity(subject, count);
    }

    @Transactional
    public SubjectDto createSubject(User user, CreateSubjectRequest request) {
        Subject subject = new Subject(
            UUID.randomUUID(),
            user,
            request.name().trim(),
            request.description() != null ? request.description().trim() : null
        );

        Subject saved = subjectRepository.save(subject);
        return SubjectDto.fromEntity(saved, 0);
    }

    @Transactional
    public SubjectDto updateSubject(User user, UUID subjectId, UpdateSubjectRequest request) {
        Subject subject = subjectRepository.findByIdAndUserId(subjectId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        subject.setName(request.name().trim());
        if (request.description() != null) {
            subject.setDescription(request.description().trim());
        }
        if (request.archived() != null) {
            subject.setArchived(request.archived());
        }

        Subject updated = subjectRepository.save(subject);
        long count = topicRepository.countActiveBySubjectId(updated.getId());
        return SubjectDto.fromEntity(updated, count);
    }

    @Transactional
    public void archiveSubject(User user, UUID subjectId) {
        Subject subject = subjectRepository.findByIdAndUserId(subjectId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        subject.setArchived(true);
        subjectRepository.save(subject);
    }
}
