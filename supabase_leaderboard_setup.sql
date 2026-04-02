-- =============================================
-- LEADERBOARD TABLE SETUP
-- Run this in your Supabase SQL Editor
-- =============================================

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    company TEXT NOT NULL,
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

-- Policy: Everyone can read leaderboard
CREATE POLICY "Public read leaderboard" ON leaderboard FOR SELECT USING (true);

-- Policy: Authenticated users can insert
CREATE POLICY "Auth insert leaderboard" ON leaderboard FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update their own
CREATE POLICY "Auth update own leaderboard" ON leaderboard FOR UPDATE USING (auth.uid() = user_id);

-- Insert demo leaderboard data
INSERT INTO leaderboard (user_name, company, score, challenges, accuracy, rank, month, year)
VALUES 
    ('Alex Chen', 'Google', 2450, 48, 92.5, 1, 2, 2026),
    ('Sarah Kim', 'Meta', 2380, 45, 89.0, 2, 2, 2026),
    ('James Liu', 'Amazon', 2250, 42, 87.3, 3, 2, 2026),
    ('Priya Sharma', 'Apple', 2180, 40, 85.0, 4, 2, 2026),
    ('Mike Johnson', 'Netflix', 2100, 38, 84.2, 5, 2, 2026),
    ('Emma Wilson', 'Google', 2050, 36, 82.0, 6, 2, 2026),
    ('David Lee', 'Meta', 1980, 34, 81.5, 7, 2, 2026),
    ('Lisa Brown', 'Amazon', 1920, 32, 80.0, 8, 2, 2026),
    ('Tom Harris', 'Netflix', 1850, 30, 78.5, 9, 2, 2026),
    ('Amy Zhang', 'Apple', 1800, 28, 77.0, 10, 2, 2026)
ON CONFLICT DO NOTHING;

SELECT 'Leaderboard table created successfully!' as status;

