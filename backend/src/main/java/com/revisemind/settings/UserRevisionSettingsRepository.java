package com.revisemind.settings;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface UserRevisionSettingsRepository extends JpaRepository<UserRevisionSettings, UUID> {
}
