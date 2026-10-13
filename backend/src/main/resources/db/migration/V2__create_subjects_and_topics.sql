CREATE TABLE subjects (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subjects_user_archived_name ON subjects(user_id, archived, name);

CREATE TABLE topics (
    id UUID PRIMARY KEY,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(160) NOT NULL,
    description TEXT,
    archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_topics_subject_archived_name ON topics(subject_id, archived, name);
