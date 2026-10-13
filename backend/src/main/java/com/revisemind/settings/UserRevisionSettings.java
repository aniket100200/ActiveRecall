package com.revisemind.settings;

import com.revisemind.user.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Entity
@Table(name = "user_revision_settings")
public class UserRevisionSettings {

    @Id
    private UUID userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "schedule_offsets", nullable = false, length = 100)
    private String scheduleOffsets = "0,3,7,14,21";

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public UserRevisionSettings() {
    }

    public UserRevisionSettings(User user, String scheduleOffsets) {
        this.user = user;
        this.userId = user.getId();
        this.scheduleOffsets = scheduleOffsets != null ? scheduleOffsets : "0,3,7,14,21";
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public List<Integer> getOffsetsList() {
        if (scheduleOffsets == null || scheduleOffsets.isBlank()) {
            return List.of(0, 3, 7, 14, 21);
        }
        return Arrays.stream(scheduleOffsets.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .map(Integer::parseInt)
            .collect(Collectors.toList());
    }

    public void setOffsetsList(List<Integer> offsets) {
        if (offsets == null || offsets.isEmpty()) {
            this.scheduleOffsets = "0,3,7,14,21";
        } else {
            this.scheduleOffsets = offsets.stream()
                .map(Object::toString)
                .collect(Collectors.joining(","));
        }
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
        if (user != null) {
            this.userId = user.getId();
        }
    }

    public String getScheduleOffsets() {
        return scheduleOffsets;
    }

    public void setScheduleOffsets(String scheduleOffsets) {
        this.scheduleOffsets = scheduleOffsets;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
