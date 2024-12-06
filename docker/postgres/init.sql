-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    s3_key VARCHAR(255) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(255),
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    device_info VARCHAR(255),
    UNIQUE(user_id, refresh_token)
);

-- Create flashcard decks table
CREATE TABLE IF NOT EXISTS flashcard_decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_active_deck_per_file UNIQUE NULLS NOT DISTINCT (file_id, is_active)
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    front_content TEXT NOT NULL,
    back_content TEXT NOT NULL,
    page_number INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create learning progress table
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    flashcard_id UUID REFERENCES flashcards(id) ON DELETE CASCADE,
    ease_factor FLOAT DEFAULT 2.5,
    interval INTEGER DEFAULT 0,
    repetitions INTEGER DEFAULT 0,
    last_reviewed TIMESTAMP WITH TIME ZONE,
    next_review TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create podcasts table
CREATE TABLE IF NOT EXISTS podcasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- in seconds
    s3_audio_key VARCHAR(255) NOT NULL,
    s3_transcript_txt_key VARCHAR(255) NOT NULL,
    s3_transcript_vtt_key VARCHAR(255),
    transcript_status VARCHAR(50) DEFAULT 'txt_only',
    total_plays INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create podcast progress table
CREATE TABLE IF NOT EXISTS podcast_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
    current_position INTEGER DEFAULT 0,
    playback_speed FLOAT DEFAULT 1.0,
    completed_segments INTEGER[],
    completion_percentage FLOAT DEFAULT 0.0,
    last_played_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create podcast analytics table
CREATE TABLE IF NOT EXISTS podcast_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_time_listened INTEGER DEFAULT 0,
    average_speed FLOAT DEFAULT 1.0,
    number_of_sessions INTEGER DEFAULT 0,
    completion_rate FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_is_deleted ON files(is_deleted);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user_id ON flashcard_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_file_id ON flashcard_decks(file_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_is_active ON flashcard_decks(is_active);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_is_active ON flashcards(is_active);
CREATE INDEX IF NOT EXISTS idx_flashcards_page_number ON flashcards(page_number);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_flashcard_id ON learning_progress(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_next_review ON learning_progress(next_review);
CREATE INDEX IF NOT EXISTS idx_podcasts_user_id ON podcasts(user_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_file_id ON podcasts(file_id);
CREATE INDEX IF NOT EXISTS idx_podcast_progress_user_id ON podcast_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_progress_podcast_id ON podcast_progress(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_analytics_user_id ON podcast_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_analytics_podcast_id ON podcast_analytics(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_analytics_date ON podcast_analytics(date);

-- Create quiz tables
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'subjective')),
    content TEXT NOT NULL,
    explanation TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS question_concepts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    concept VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS multiple_choice_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjective_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    score FLOAT,
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS question_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    response TEXT NOT NULL,
    is_correct BOOLEAN,
    confidence_score FLOAT,
    time_taken INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_quizzes_file_id ON quizzes(file_id);
CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX idx_quizzes_is_active ON quizzes(is_active);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_questions_question_type ON questions(question_type);
CREATE INDEX idx_question_concepts_question_id ON question_concepts(question_id);
CREATE INDEX idx_question_concepts_concept ON question_concepts(concept);
CREATE INDEX idx_multiple_choice_options_question_id ON multiple_choice_options(question_id);
CREATE INDEX idx_subjective_answers_question_id ON subjective_answers(question_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_status ON quiz_attempts(status);
CREATE INDEX idx_question_responses_attempt_id ON question_responses(attempt_id);
CREATE INDEX idx_question_responses_question_id ON question_responses(question_id);

-- Create triggers for updated_at
CREATE TRIGGER update_quizzes_updated_at
    BEFORE UPDATE ON quizzes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_attempts_updated_at
    BEFORE UPDATE ON quiz_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create views for analytics
CREATE OR REPLACE VIEW file_quiz_stats AS
SELECT 
    f.id as file_id,
    f.filename,
    COUNT(DISTINCT q.id) as total_quizzes,
    COUNT(DISTINCT que.id) as total_questions,
    COUNT(DISTINCT qa.id) as total_attempts,
    AVG(qa.score) as average_score,
    COUNT(DISTINCT qa.user_id) as unique_participants,
    SUM(qr.time_taken) as total_time_spent,
    COUNT(DISTINCT qc.concept) as unique_concepts,
    SUM(CASE WHEN que.question_type = 'multiple_choice' THEN 1 ELSE 0 END) as multiple_choice_count,
    SUM(CASE WHEN que.question_type = 'subjective' THEN 1 ELSE 0 END) as subjective_count,
    AVG(CASE WHEN qr.is_correct IS NOT NULL THEN qr.is_correct::int ELSE NULL END) * 100 as success_rate
FROM files f
LEFT JOIN quizzes q ON f.id = q.file_id
LEFT JOIN questions que ON q.id = que.quiz_id
LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
LEFT JOIN question_responses qr ON qa.id = qr.attempt_id
LEFT JOIN question_concepts qc ON que.id = qc.question_id
WHERE q.is_active = true AND que.is_active = true
GROUP BY f.id, f.filename;

-- Create function for quiz statistics
CREATE OR REPLACE FUNCTION get_quiz_statistics(quiz_id_param UUID)
RETURNS TABLE (
    total_attempts INTEGER,
    average_score FLOAT,
    average_time_per_question INTEGER,
    concept_success_rates JSON,
    question_success_rates JSON
) AS $$
BEGIN
    RETURN QUERY
    WITH concept_stats AS (
        SELECT 
            qc.concept,
            AVG(CASE WHEN qr.is_correct IS NOT NULL THEN qr.is_correct::int ELSE NULL END) * 100 as success_rate
        FROM questions q
        JOIN question_concepts qc ON q.id = qc.question_id
        LEFT JOIN question_responses qr ON q.id = qr.question_id
        WHERE q.quiz_id = quiz_id_param
        GROUP BY qc.concept
    ),
    question_stats AS (
        SELECT 
            q.id,
            q.content,
            AVG(CASE WHEN qr.is_correct IS NOT NULL THEN qr.is_correct::int ELSE NULL END) * 100 as success_rate,
            AVG(qr.time_taken) as avg_time
        FROM questions q
        LEFT JOIN question_responses qr ON q.id = qr.question_id
        WHERE q.quiz_id = quiz_id_param
        GROUP BY q.id, q.content
    )
    SELECT 
        COUNT(DISTINCT qa.id)::INTEGER as total_attempts,
        AVG(qa.score)::FLOAT as average_score,
        AVG(qr.time_taken)::INTEGER as average_time_per_question,
        (SELECT json_object_agg(concept, success_rate) FROM concept_stats) as concept_success_rates,
        (SELECT json_object_agg(content, json_build_object('success_rate', success_rate, 'avg_time', avg_time)) 
         FROM question_stats) as question_success_rates
    FROM quizzes q
    LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
    LEFT JOIN question_responses qr ON qa.id = qr.attempt_id
    WHERE q.id = quiz_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcard_decks_updated_at
    BEFORE UPDATE ON flashcard_decks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at
    BEFORE UPDATE ON flashcards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at
    BEFORE UPDATE ON learning_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_podcasts_updated_at
    BEFORE UPDATE ON podcasts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_podcast_progress_updated_at
    BEFORE UPDATE ON podcast_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_podcast_analytics_updated_at
    BEFORE UPDATE ON podcast_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create useful views
CREATE OR REPLACE VIEW user_study_stats AS
SELECT 
    u.id as user_id,
    u.email,
    u.username,
    COUNT(DISTINCT fd.id) as total_decks,
    COUNT(DISTINCT f.id) as total_cards,
    COUNT(DISTINCT fd.file_id) as files_with_decks,
    COALESCE(AVG(lp.ease_factor), 2.5) as avg_performance
FROM users u
LEFT JOIN flashcard_decks fd ON u.id = fd.user_id AND fd.is_active = true
LEFT JOIN flashcards f ON fd.id = f.deck_id AND f.is_active = true
LEFT JOIN learning_progress lp ON f.id = lp.flashcard_id
GROUP BY u.id, u.email, u.username;

CREATE OR REPLACE VIEW due_cards_view AS
SELECT 
    lp.user_id,
    fd.id as deck_id,
    fd.title as deck_title,    
    COUNT(*) as due_cards_count
FROM learning_progress lp
JOIN flashcards f ON lp.flashcard_id = f.id AND f.is_active = true
JOIN flashcard_decks fd ON f.deck_id = fd.id AND fd.is_active = true
WHERE lp.next_review <= CURRENT_TIMESTAMP
GROUP BY lp.user_id, fd.id, fd.title;

CREATE OR REPLACE VIEW user_podcast_stats AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(DISTINCT p.id) as total_podcasts,
    SUM(p.duration) as total_content_duration,
    AVG(pa.completion_rate) as avg_completion_rate,
    AVG(pa.average_speed) as avg_playback_speed,
    SUM(pa.total_time_listened) as total_time_listened
FROM users u
LEFT JOIN podcasts p ON u.id = p.user_id
LEFT JOIN podcast_analytics pa ON p.id = pa.podcast_id
GROUP BY u.id, u.username;

CREATE OR REPLACE VIEW podcast_engagement_stats AS
SELECT 
    p.id as podcast_id,
    p.title,
    COUNT(DISTINCT pp.user_id) as unique_listeners,
    AVG(pp.completion_percentage) as avg_completion,
    p.total_plays,
    COUNT(DISTINCT pa.date) as days_accessed
FROM podcasts p
LEFT JOIN podcast_progress pp ON p.id = pp.podcast_id
LEFT JOIN podcast_analytics pa ON p.id = pa.podcast_id
GROUP BY p.id, p.title, p.total_plays;

-- Create useful functions
CREATE OR REPLACE FUNCTION get_deck_statistics(deck_id_param UUID)
RETURNS TABLE (
    total_cards INTEGER,
    mastered_cards INTEGER,
    learning_cards INTEGER,
    mastery_percentage NUMERIC,
    distinct_pages INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT f.id)::INTEGER as total_cards,
        COUNT(DISTINCT CASE WHEN lp.interval >= 21 THEN f.id END)::INTEGER as mastered_cards,
        COUNT(DISTINCT CASE WHEN lp.interval < 21 THEN f.id END)::INTEGER as learning_cards,
        ROUND(COUNT(DISTINCT CASE WHEN lp.interval >= 21 THEN f.id END)::NUMERIC / 
              NULLIF(COUNT(DISTINCT f.id), 0) * 100, 2) as mastery_percentage,
        COUNT(DISTINCT f.page_number)::INTEGER as distinct_pages
    FROM flashcards f
    LEFT JOIN learning_progress lp ON f.id = lp.flashcard_id
    WHERE f.deck_id = deck_id_param
    AND f.is_active = true;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_podcast_statistics(podcast_id_param UUID)
RETURNS TABLE (
    total_listeners INTEGER,
    average_completion FLOAT,
    total_listening_time INTEGER,
    average_speed FLOAT,
    engagement_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT pp.user_id)::INTEGER as total_listeners,
        AVG(pp.completion_percentage)::FLOAT as average_completion,
        SUM(pa.total_time_listened)::INTEGER as total_listening_time,
        AVG(pa.average_speed)::FLOAT as average_speed,
        (COUNT(DISTINCT pp.user_id) * AVG(pp.completion_percentage) / 100.0)::FLOAT as engagement_score
    FROM podcasts p
    LEFT JOIN podcast_progress pp ON p.id = pp.podcast_id
    LEFT JOIN podcast_analytics pa ON p.id = pa.podcast_id
    WHERE p.id = podcast_id_param;
END;
$$ LANGUAGE plpgsql;