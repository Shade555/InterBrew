-- =============================================
-- COMPLETE DATABASE FIX - Run ALL of this in your Supabase SQL Editor
-- =============================================

-- =============================================
-- STEP 1: CREATE ALL TABLES
-- =============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT,
    domain TEXT,
    interviews_taken INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    name TEXT NOT NULL UNIQUE,
    logo TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge_sets table
CREATE TABLE IF NOT EXISTS challenge_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    company TEXT NOT NULL,
    title TEXT,
    description TEXT,
    time_limit INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
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

-- Create attempts table
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

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    attempt_id UUID REFERENCES attempts(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    selected_answer TEXT,
    is_correct BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaderboard table
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

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_name TEXT NOT NULL,
    badge_icon TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create certifications table
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    issuer TEXT,
    issue_date DATE,
    credential_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 2: ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 3: CREATE RLS POLICIES
-- =============================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id OR true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Challenge sets - everyone can read
DROP POLICY IF EXISTS "Anyone can view challenge_sets" ON challenge_sets;
CREATE POLICY "Anyone can view challenge_sets" ON challenge_sets FOR SELECT USING (true);

-- Questions - everyone can read
DROP POLICY IF EXISTS "Anyone can view questions" ON questions;
CREATE POLICY "Anyone can view questions" ON questions FOR SELECT USING (true);

-- Attempts - users can view their own
DROP POLICY IF EXISTS "Users can view own attempts" ON attempts;
CREATE POLICY "Users can view own attempts" ON attempts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert attempts" ON attempts;
CREATE POLICY "Users can insert attempts" ON attempts FOR INSERT WITH CHECK (auth.uid() = user_id OR true);

-- Leaderboard - everyone can read
DROP POLICY IF EXISTS "Public read leaderboard" ON leaderboard;
CREATE POLICY "Public read leaderboard" ON leaderboard FOR SELECT USING (true);

-- Companies - everyone can read
DROP POLICY IF EXISTS "Anyone can view companies" ON companies;
CREATE POLICY "Anyone can view companies" ON companies FOR SELECT USING (true);

-- =============================================
-- STEP 4: CREATE TRIGGER FUNCTION (FIXED - uses profiles not public.profiles)
-- =============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- STEP 5: GRANT PERMISSIONS
-- =============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO service_role;

GRANT SELECT ON challenge_sets TO authenticated, anon, service_role;
GRANT SELECT ON questions TO authenticated, anon, service_role;
GRANT SELECT, INSERT ON attempts TO authenticated, anon, service_role;
GRANT SELECT ON leaderboard TO authenticated, anon, service_role;
GRANT SELECT ON companies TO authenticated, anon, service_role;

-- =============================================
-- STEP 6: INSERT SAMPLE DATA
-- =============================================

-- Insert companies
INSERT INTO companies (id, name, logo, description) VALUES 
('0b7992a0-d14a-45fd-a187-3a747406808b', 'Meta', '◉', 'Meta SWE Interview'),
('5b06b46d-1e9c-46c8-a29a-8d6e1671178b', 'Amazon', '◈', 'Amazon SDE Interview'),
('0e151b95-cc9a-4aa1-aba3-648774d38101', 'Netflix', '▶', 'Netflix System Design'),
('9ae0a578-62e8-44c3-a5e5-90a1f479b9ce', 'Google', '◎', 'Google SWE Interview'),
('508b6dc5-e00d-4fd2-8127-62555e7fb720', 'Apple', '◆', 'Apple iOS Engineer')
ON CONFLICT (name) DO NOTHING;

-- Insert challenge sets
INSERT INTO challenge_sets (company, title, description, time_limit) VALUES 
('Meta', 'Meta SWE Interview', 'Coding and system design questions for Meta SWE position', 30),
('Amazon', 'Amazon SDE II Interview', 'Leadership principles and technical questions', 30),
('Netflix', 'Netflix System Design', 'System design and architecture questions', 30),
('Google', 'Google SWE L4 Interview', 'Algorithms and data structures', 30),
('Apple', 'Apple iOS Engineer', 'iOS development and Swift questions', 30)
ON CONFLICT DO NOTHING;

-- Insert leaderboard sample data
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

-- Insert sample questions for Meta
INSERT INTO questions (challenge_set_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, category)
SELECT 
    cs.id,
    'What is the time complexity of finding an element in a hash map?',
    'O(n)', 'O(log n)', 'O(1)', 'O(n²)',
    'C',
    'Hash maps offer O(1) average-case lookup.',
    'easy',
    'coding'
FROM challenge_sets cs WHERE cs.company = 'Meta'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.challenge_set_id = cs.id AND q.question_text LIKE '%hash map%');

-- Insert more questions for other companies
INSERT INTO questions (challenge_set_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, category)
SELECT 
    cs.id,
    'Time complexity of merge sort?',
    'O(n)', 'O(n log n)', 'O(n²)', 'O(log n)',
    'B',
    'Merge sort is O(n log n).',
    'easy',
    'coding'
FROM challenge_sets cs WHERE cs.company = 'Amazon'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.challenge_set_id = cs.id AND q.question_text LIKE '%merge sort%');

INSERT INTO questions (challenge_set_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, category)
SELECT 
    cs.id,
    'Time complexity of binary search?',
    'O(n)', 'O(n²)', 'O(log n)', 'O(1)',
    'C',
    'Binary search halves the search space.',
    'easy',
    'coding'
FROM challenge_sets cs WHERE cs.company = 'Google'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.challenge_set_id = cs.id AND q.question_text LIKE '%binary search%');

SELECT 'Database setup completed successfully!' as status;
