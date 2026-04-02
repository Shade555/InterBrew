-- =============================================
-- COMPLETE DATABASE FIX
-- Run this in your Supabase SQL Editor
-- =============================================

-- =============================================
-- STEP 0: CREATE COMPANIES TABLE (required for leaderboard)
-- =============================================

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    name TEXT NOT NULL UNIQUE,
    logo TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read
DROP POLICY IF EXISTS "Anyone can view companies" ON companies;
CREATE POLICY "Anyone can view companies" ON companies FOR SELECT USING (true);

-- Insert sample companies (matching your existing challenge_sets data)
INSERT INTO companies (id, name, logo, description) 
SELECT '0b7992a0-d14a-45fd-a187-3a747406808b', 'Meta', '◉', 'Meta SWE Interview'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'Meta');

INSERT INTO companies (id, name, logo, description) 
SELECT '5b06b46d-1e9c-46c8-a29a-8d6e1671178b', 'Amazon', '◈', 'Amazon SDE Interview'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'Amazon');

INSERT INTO companies (id, name, logo, description) 
SELECT '0e151b95-cc9a-4aa1-aba3-648774d38101', 'Netflix', '▶', 'Netflix System Design'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'Netflix');

INSERT INTO companies (id, name, logo, description) 
SELECT '9ae0a578-62e8-44c3-a5e5-90a1f479b9ce', 'Google', '◎', 'Google SWE Interview'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'Google');

INSERT INTO companies (id, name, logo, description) 
SELECT '508b6dc5-e00d-4fd2-8127-62555e7fb720', 'Apple', '◆', 'Apple iOS Engineer'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'Apple');

-- =============================================
-- STEP 1: FIX CHALLENGE_SETS TABLE (if needed)
-- =============================================

-- Create challenge_sets table if not exists (fixes "column challenge_sets.company does not exist")
CREATE TABLE IF NOT EXISTS challenge_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    company TEXT NOT NULL,
    title TEXT,
    description TEXT,
    time_limit INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE challenge_sets ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view
DROP POLICY IF EXISTS "Anyone can view challenge_sets" ON challenge_sets;
CREATE POLICY "Anyone can view challenge_sets" ON challenge_sets FOR SELECT USING (true);

-- =============================================
-- STEP 2: FIX QUESTIONS TABLE (if needed)
-- =============================================

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    challenge_set_id UUID REFERENCES challenge_sets(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    difficulty TEXT DEFAULT 'medium',
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view
DROP POLICY IF EXISTS "Anyone can view questions" ON questions;
CREATE POLICY "Anyone can view questions" ON questions FOR SELECT USING (true);

-- =============================================
-- STEP 3: FIX ATTEMPTS TABLE (if needed)
-- =============================================

CREATE TABLE IF NOT EXISTS attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    challenge_set_id UUID REFERENCES challenge_sets(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'in_progress',
    score INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own
DROP POLICY IF EXISTS "Users can view own attempts" ON attempts;
CREATE POLICY "Users can view own attempts" ON attempts FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- STEP 4: FIX ANSWERS TABLE (if needed)
-- =============================================

CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    attempt_id UUID REFERENCES attempts(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    selected_answer TEXT,
    is_correct BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 5: CREATE INDEXES (if needed)
-- =============================================

CREATE INDEX IF NOT EXISTS idx_questions_challenge_set_id ON questions(challenge_set_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_challenge_set_id ON attempts(challenge_set_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON attempts(status);
CREATE INDEX IF NOT EXISTS idx_answers_attempt_id ON answers(attempt_id);

-- =============================================
-- STEP 6: FIX LEADERBOARD TABLE (with foreign key to companies)
-- =============================================

-- Drop if exists with wrong schema
DROP TABLE IF EXISTS leaderboard CASCADE;

-- Create leaderboard with foreign key to companies
CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    challenges INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0,
    rank INTEGER,
    month INTEGER DEFAULT 2,
    year INTEGER DEFAULT 2026,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read
DROP POLICY IF EXISTS "Public read leaderboard" ON leaderboard;
CREATE POLICY "Public read leaderboard" ON leaderboard FOR SELECT USING (true);

-- =============================================
-- STEP 7: INSERT SAMPLE DATA (only if tables are empty)
-- =============================================

-- Insert sample challenge sets if none exist
INSERT INTO challenge_sets (company, title, description, time_limit) 
SELECT 'Meta', 'Meta SWE Interview', 'Coding and system design questions for Meta SWE position', 30
WHERE NOT EXISTS (SELECT 1 FROM challenge_sets WHERE company = 'Meta');

INSERT INTO challenge_sets (company, title, description, time_limit) 
SELECT 'Amazon', 'Amazon SDE II Interview', 'Leadership principles and technical questions', 30
WHERE NOT EXISTS (SELECT 1 FROM challenge_sets WHERE company = 'Amazon');

INSERT INTO challenge_sets (company, title, description, time_limit) 
SELECT 'Netflix', 'Netflix System Design', 'System design and architecture questions', 30
WHERE NOT EXISTS (SELECT 1 FROM challenge_sets WHERE company = 'Netflix');

INSERT INTO challenge_sets (company, title, description, time_limit) 
SELECT 'Google', 'Google SWE L4 Interview', 'Algorithms and data structures', 30
WHERE NOT EXISTS (SELECT 1 FROM challenge_sets WHERE company = 'Google');

INSERT INTO challenge_sets (company, title, description, time_limit) 
SELECT 'Apple', 'Apple iOS Engineer', 'iOS development and Swift questions', 30
WHERE NOT EXISTS (SELECT 1 FROM challenge_sets WHERE company = 'Apple');

-- Insert sample leaderboard data with company_id foreign key
INSERT INTO leaderboard (user_name, company_id, score, challenges, accuracy, rank, month, year)
SELECT 'Alex Chen', (SELECT id FROM companies WHERE name = 'Google'), 2450, 48, 92.5, 1, 2, 2026
WHERE NOT EXISTS (SELECT 1 FROM leaderboard WHERE user_name = 'Alex Chen');

INSERT INTO leaderboard (user_name, company_id, score, challenges, accuracy, rank, month, year)
SELECT 'Sarah Kim', (SELECT id FROM companies WHERE name = 'Meta'), 2380, 45, 89.0, 2, 2, 2026
WHERE NOT EXISTS (SELECT 1 FROM leaderboard WHERE user_name = 'Sarah Kim');

INSERT INTO leaderboard (user_name, company_id, score, challenges, accuracy, rank, month, year)
SELECT 'James Liu', (SELECT id FROM companies WHERE name = 'Amazon'), 2250, 42, 87.3, 3, 2, 2026
WHERE NOT EXISTS (SELECT 1 FROM leaderboard WHERE user_name = 'James Liu');

INSERT INTO leaderboard (user_name, company_id, score, challenges, accuracy, rank, month, year)
SELECT 'Priya Sharma', (SELECT id FROM companies WHERE name = 'Apple'), 2180, 40, 85.0, 4, 2, 2026
WHERE NOT EXISTS (SELECT 1 FROM leaderboard WHERE user_name = 'Priya Sharma');

INSERT INTO leaderboard (user_name, company_id, score, challenges, accuracy, rank, month, year)
SELECT 'Mike Johnson', (SELECT id FROM companies WHERE name = 'Netflix'), 2100, 38, 84.2, 5, 2, 2026
WHERE NOT EXISTS (SELECT 1 FROM leaderboard WHERE user_name = 'Mike Johnson');

SELECT 'Database fix completed successfully!' as status;

