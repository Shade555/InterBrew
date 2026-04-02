-- =============================================
-- SIMPLE DATABASE FIX - Copy and run this entire block
-- =============================================

-- 1. Create tables (will not fail if they exist)
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

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    name TEXT NOT NULL UNIQUE,
    logo TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    company TEXT NOT NULL,
    title TEXT,
    description TEXT,
    time_limit INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- 2. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- 3. Create simple policies (allow all for now to debug)
DROP POLICY IF EXISTS "public_access_profiles" ON profiles;
CREATE POLICY "public_access_profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_access_companies" ON companies;
CREATE POLICY "public_access_companies" ON companies FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_access_challenge_sets" ON challenge_sets;
CREATE POLICY "public_access_challenge_sets" ON challenge_sets FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_access_questions" ON questions;
CREATE POLICY "public_access_questions" ON questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_access_leaderboard" ON leaderboard;
CREATE POLICY "public_access_leaderboard" ON leaderboard FOR SELECT USING (true);

-- 4. Insert sample data
INSERT INTO companies (name, logo, description) VALUES 
('Meta', '◉', 'Meta SWE'),
('Amazon', '◈', 'Amazon SDE'),
('Netflix', '▶', 'Netflix'),
('Google', '◎', 'Google'),
('Apple', '◆', 'Apple')
ON CONFLICT (name) DO NOTHING;

INSERT INTO challenge_sets (company, title, description, time_limit) VALUES 
('Meta', 'Meta Interview', 'Meta coding questions', 30),
('Amazon', 'Amazon Interview', 'Amazon coding questions', 30),
('Netflix', 'Netflix Interview', 'Netflix coding questions', 30),
('Google', 'Google Interview', 'Google coding questions', 30),
('Apple', 'Apple Interview', 'Apple coding questions', 30)
ON CONFLICT DO NOTHING;

-- Insert questions for each company
DO $$
DECLARE 
    meta_id UUID;
    amazon_id UUID;
    google_id UUID;
BEGIN
    SELECT id INTO meta_id FROM companies WHERE name = 'Meta';
    SELECT id INTO amazon_id FROM companies WHERE name = 'Amazon';
    SELECT google_id FROM companies WHERE name = 'Google';
    
    -- Get challenge_set IDs
    INSERT INTO challenge_sets (company, title, description, time_limit)
    SELECT 'Meta', 'Meta SWE', 'Meta questions', 30
    WHERE NOT EXISTS (SELECT 1 FROM challenge_sets WHERE company = 'Meta');
    
    INSERT INTO challenge_sets (company, title, description, time_limit)
    SELECT 'Amazon', 'Amazon SDE', 'Amazon questions', 30
    WHERE NOT EXISTS (SELECT 1 FROM challenge_sets WHERE company = 'Amazon');
    
    INSERT INTO challenge_sets (company, title, description, time_limit)
    SELECT 'Google', 'Google L4', 'Google questions', 30
    WHERE NOT EXISTS (SELECT 1 FROM challenge_sets WHERE company = 'Google');
    
    INSERT INTO challenge_sets (company, title, description, time_limit)
    SELECT 'Netflix', 'Netflix SD', 'Netflix questions', 30
    WHERE NOT EXISTS (SELECT 1 FROM challenge_sets WHERE company = 'Netflix');
    
    INSERT INTO challenge_sets (company, title, description, time_limit)
    SELECT 'Apple', 'Apple iOS', 'Apple questions', 30
    WHERE NOT EXISTS (SELECT 1 FROM challenge_sets WHERE company = 'Apple');
END $$;

-- Insert leaderboard sample
INSERT INTO leaderboard (user_name, company_id, score, challenges, accuracy, rank, month, year)
SELECT 'Alex Chen', (SELECT id FROM companies WHERE name = 'Google' LIMIT 1), 2450, 48, 92.5, 1, 2, 2026
WHERE NOT EXISTS (SELECT 1 FROM leaderboard WHERE user_name = 'Alex Chen');

SELECT 'Setup complete!' as message;
