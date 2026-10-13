package com.revisemind.subject;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface SubjectRepository extends JpaRepository<Subject, UUID> {

    Page<Subject> findByUserIdAndArchived(UUID userId, boolean archived, Pageable pageable);

    Page<Subject> findByUserId(UUID userId, Pageable pageable);

    Optional<Subject> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT COUNT(s) FROM Subject s WHERE s.user.id = :userId AND s.archived = false")
    long countActiveByUserId(@Param("userId") UUID userId);
}
