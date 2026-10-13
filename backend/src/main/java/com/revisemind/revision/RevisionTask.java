package com.revisemind.revision;

import com.revisemind.study.StudySession;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "revision_tasks", uniqueConstraints = {
    @UniqueConstraint(name = "uk_revision_task_session_offset", columnNames = {"study_session_id", "schedule_offset_days"})
})
public class RevisionTask {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "study_session_id", nullable = false)
    private StudySession studySession;

    @Column(name = "schedule_offset_days", nullable = false)
    private int scheduleOffsetDays;

    @Column(name = "due_at", nullable = false)
    private Instant dueAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RevisionStatus status = RevisionStatus.PENDING;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private RevisionOutcome outcome;

    @Column(columnDefinition = "TEXT")
    private String reflection;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public RevisionTask() {
    }

    public RevisionTask(UUID id, StudySession studySession, int scheduleOffsetDays, Instant dueAt) {
        this.id = id;
        this.studySession = studySession;
        this.scheduleOffsetDays = scheduleOffsetDays;
        this.dueAt = dueAt;
        this.status = RevisionStatus.PENDING;
    }

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public StudySession getStudySession() {
        return studySession;
    }

    public void setStudySession(StudySession studySession) {
        this.studySession = studySession;
    }

    public int getScheduleOffsetDays() {
        return scheduleOffsetDays;
    }

    public void setScheduleOffsetDays(int scheduleOffsetDays) {
        this.scheduleOffsetDays = scheduleOffsetDays;
    }

    public Instant getDueAt() {
        return dueAt;
    }

    public void setDueAt(Instant dueAt) {
        this.dueAt = dueAt;
    }

    public RevisionStatus getStatus() {
        return status;
    }

    public void setStatus(RevisionStatus status) {
        this.status = status;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public RevisionOutcome getOutcome() {
        return outcome;
    }

    public void setOutcome(RevisionOutcome outcome) {
        this.outcome = outcome;
    }

    public String getReflection() {
        return reflection;
    }

    public void setReflection(String reflection) {
        this.reflection = reflection;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
