CREATE TABLE user_revision_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    schedule_offsets VARCHAR(100) NOT NULL DEFAULT '0,3,7,14,21',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE study_sessions (
    id UUID PRIMARY KEY,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    title VARCHAR(200),
    notes TEXT,
    studied_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_study_sessions_topic_studied ON study_sessions(topic_id, studied_at DESC);

CREATE TABLE revision_tasks (
    id UUID PRIMARY KEY,
    study_session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
    schedule_offset_days INTEGER NOT NULL CHECK (schedule_offset_days >= 0),
    due_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    completed_at TIMESTAMP WITH TIME ZONE,
    outcome VARCHAR(20) CHECK (outcome IS NULL OR outcome IN ('AGAIN', 'HARD', 'GOOD', 'EASY')),
    reflection TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_revision_task_session_offset UNIQUE (study_session_id, schedule_offset_days)
);

CREATE INDEX idx_revision_tasks_status_due ON revision_tasks(status, due_at);
