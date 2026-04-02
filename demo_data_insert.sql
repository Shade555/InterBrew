-- =============================================
-- INTERBREW DEMO DATA INSERTION
-- Run this in your Supabase SQL Editor
-- This creates demo users, leaderboard entries, badges, and certifications
-- =============================================

-- =============================================
-- STEP 1: CREATE BADGES TABLE (if not exists)
-- =============================================
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_name TEXT NOT NULL,
    badge_icon TEXT,
    description TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all badges (for leaderboard)
CREATE POLICY "Allow read access to badges" ON badges
    FOR SELECT TO authenticated USING (true);

-- =============================================
-- STEP 2: CREATE CERTIFICATIONS TABLE (if not exists)
-- =============================================
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    credential_id TEXT,
    credential_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all certifications (for profile)
CREATE POLICY "Allow read access to certifications" ON certifications
    FOR SELECT TO authenticated USING (true);

-- =============================================
-- STEP 3: CREATE DEMO USERS (for demonstration)
-- Note: These are placeholder user IDs - in production, 
-- users would be created through signup
-- =============================================

-- Create demo user profiles (using placeholder IDs)
-- These IDs are for demonstration - in real app, users sign up
INSERT INTO profiles (id, email, full_name, role, domain, interviews_taken, completed, accuracy, created_at)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'alex.chen@google.com', 'Alex Chen', 'Software Engineer', 'Google', 48, 45, 92.5, NOW() - INTERVAL '30 days'),
    ('00000000-0000-0000-0000-000000000002', 'sarah.kim@meta.com', 'Sarah Kim', 'Frontend Developer', 'Meta', 45, 42, 89.0, NOW() - INTERVAL '25 days'),
    ('00000000-0000-0000-0000-000000000003', 'james.liu@amazon.com', 'James Liu', 'Full Stack Developer', 'Amazon', 42, 40, 87.3, NOW() - INTERVAL '20 days'),
    ('00000000-0000-0000-0000-000000000004', 'priya.sharma@apple.com', 'Priya Sharma', 'iOS Developer', 'Apple', 40, 38, 85.0, NOW() - INTERVAL '18 days'),
    ('00000000-0000-0000-0000-000000000005', 'mike.johnson@netflix.com', 'Mike Johnson', 'Backend Engineer', 'Netflix', 38, 35, 84.2, NOW() - INTERVAL '15 days'),
    ('00000000-0000-0000-0000-000000000006', 'emma.wilson@google.com', 'Emma Wilson', 'Software Engineer', 'Google', 36, 34, 82.0, NOW() - INTERVAL '12 days'),
    ('00000000-0000-0000-0000-000000000007', 'david.lee@meta.com', 'David Lee', 'Mobile Developer', 'Meta', 34, 32, 81.5, NOW() - INTERVAL '10 days'),
    ('00000000-0000-0000-0000-000000000008', 'lisa.brown@amazon.com', 'Lisa Brown', 'DevOps Engineer', 'Amazon', 32, 30, 80.0, NOW() - INTERVAL '8 days'),
    ('00000000-0000-0000-0000-000000000009', 'tom.harris@netflix.com', 'Tom Harris', 'Software Engineer', 'Netflix', 30, 28, 78.5, NOW() - INTERVAL '5 days'),
    ('00000000-0000-0000-0000-000000000010', 'amy.zhang@apple.com', 'Amy Zhang', 'Swift Developer', 'Apple', 28, 26, 77.0, NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    interviews_taken = EXCLUDED.interviews_taken,
    completed = EXCLUDED.completed,
    accuracy = EXCLUDED.accuracy;

-- =============================================
-- STEP 4: INSERT DEMO LEADERBOARD ENTRIES
-- =============================================
-- Create a leaderboard table for public scores
CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    company TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    challenges INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0,
    rank INTEGER,
    month INTEGER,
    year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read leaderboard
CREATE POLICY "Allow public read leaderboard" ON leaderboard
    FOR SELECT TO public USING (true);

-- Insert demo leaderboard data
INSERT INTO leaderboard (user_id, user_name, company, score, challenges, accuracy, rank, month, year)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Alex Chen', 'Google', 2450, 48, 92.5, 1, 2, 2026),
    ('00000000-0000-0000-0000-000000000002', 'Sarah Kim', 'Meta', 2380, 45, 89.0, 2, 2, 2026),
    ('00000000-0000-0000-0000-000000000003', 'James Liu', 'Amazon', 2250, 42, 87.3, 3, 2, 2026),
    ('00000000-0000-0000-0000-000000000004', 'Priya Sharma', 'Apple', 2180, 40, 85.0, 4, 2, 2026),
    ('00000000-0000-0000-0000-000000000005', 'Mike Johnson', 'Netflix', 2100, 38, 84.2, 5, 2, 2026),
    ('00000000-0000-0000-0000-000000000006', 'Emma Wilson', 'Google', 2050, 36, 82.0, 6, 2, 2026),
    ('00000000-0000-0000-0000-000000000007', 'David Lee', 'Meta', 1980, 34, 81.5, 7, 2, 2026),
    ('00000000-0000-0000-0000-000000000008', 'Lisa Brown', 'Amazon', 1920, 32, 80.0, 8, 2, 2026),
    ('00000000-0000-0000-0000-000000000009', 'Tom Harris', 'Netflix', 1850, 30, 78.5, 9, 2, 2026),
    ('00000000-0000-0000-0000-000000000010', 'Amy Zhang', 'Apple', 1800, 28, 77.0, 10, 2, 2026);

-- =============================================
-- STEP 5: INSERT DEMO BADGES
-- =============================================
INSERT INTO badges (user_id, badge_name, badge_icon, description, earned_at)
VALUES 
    -- Alex Chen's badges (Google)
    ('00000000-0000-0000-0000-000000000001', 'Gold Champion', '🏆', 'Achieved top score in monthly leaderboard', NOW() - INTERVAL '25 days'),
    ('00000000-0000-0000-0000-000000000001', 'Algorithm Master', '🧠', 'Completed 50+ algorithm challenges', NOW() - INTERVAL '20 days'),
    ('00000000-0000-0000-0000-000000000001', 'Speed Demon', '⚡', 'Completed 10 challenges in under 20 minutes each', NOW() - INTERVAL '15 days'),
    ('00000000-0000-0000-0000-000000000001', 'Consistency King', '👑', '30-day streak of daily challenges', NOW() - INTERVAL '10 days'),
    
    -- Sarah Kim's badges (Meta)
    ('00000000-0000-0000-0000-000000000002', 'Silver Star', '⭐', 'Reached top 5 in monthly leaderboard', NOW() - INTERVAL '22 days'),
    ('00000000-0000-0000-0000-000000000002', 'System Design Pro', '📐', 'Completed 25+ system design challenges', NOW() - INTERVAL '18 days'),
    ('00000000-0000-0000-0000-000000000002', 'First Responder', '🚀', 'First to solve daily challenge 5 times', NOW() - INTERVAL '12 days'),
    
    -- James Liu's badges (Amazon)
    ('00000000-0000-0000-0000-000000000003', 'Bronze Warrior', '⚔️', 'Reached top 10 in monthly leaderboard', NOW() - INTERVAL '19 days'),
    ('00000000-0000-0000-0000-000000000003', 'Database Expert', '🗄️', 'Completed 20+ database challenges', NOW() - INTERVAL '14 days'),
    ('00000000-0000-0000-0000-000000000003', 'Perfect Week', '🎯', '100% accuracy for an entire week', NOW() - INTERVAL '8 days'),
    
    -- Priya Sharma's badges (Apple)
    ('00000000-0000-0000-0000-000000000004', 'iOS Pioneer', '🍎', 'Completed iOS-specific challenges', NOW() - INTERVAL '16 days'),
    ('00000000-0000-0000-0000-000000000004', 'Swift Coder', '💫', 'Mastered Swift language challenges', NOW() - INTERVAL '11 days'),
    ('00000000-0000-0000-0000-000000000004', 'Rising Star', '🌟', 'Showed significant improvement', NOW() - INTERVAL '5 days'),
    
    -- Mike Johnson's badges (Netflix)
    ('00000000-0000-0000-0000-000000000005', 'Microservice Master', '🔧', 'Completed microservices architecture challenges', NOW() - INTERVAL '13 days'),
    ('00000000-0000-0000-0000-000000000005', 'Performance Pro', '🚀', 'Achieved 90%+ in performance challenges', NOW() - INTERVAL '7 days'),
    
    -- Emma Wilson's badges (Google)
    ('00000000-0000-0000-0000-000000000006', 'Code Ninja', '🥷', 'Solved 100+ total challenges', NOW() - INTERVAL '10 days'),
    ('00000000-0000-0000-0000-000000000006', 'Team Player', '🤝', 'Participated in group challenges', NOW() - INTERVAL '4 days'),
    
    -- Additional badges for variety
    ('00000000-0000-0000-0000-000000000007', 'Frontend Expert', '🎨', 'Completed 30+ frontend challenges', NOW() - INTERVAL '9 days'),
    ('00000000-0000-0000-0000-000000000008', 'Cloud Specialist', '☁️', 'Mastered cloud platform challenges', NOW() - INTERVAL '6 days'),
    ('00000000-0000-0000-0000-000000000009', 'Backend Pro', '⚙️', 'Completed 40+ backend challenges', NOW() - INTERVAL '4 days'),
    ('00000000-0000-0000-0000-000000000010', 'Beginner Badge', '🌱', 'Completed first challenge', NOW() - INTERVAL '2 days');

-- =============================================
-- STEP 6: INSERT DEMO CERTIFICATIONS
-- =============================================
INSERT INTO certifications (user_id, title, issuer, issue_date, expiry_date, credential_id, credential_url)
VALUES 
    -- Alex Chen's certifications
    ('00000000-0000-0000-0000-000000000001', 'Google Cloud Professional Data Engineer', 'Google', '2025-06-15', '2027-06-15', 'GCP-PDE-12345', 'https://google.com/credentials/GCP-PDE-12345'),
    ('00000000-0000-0000-0000-000000000001', 'AWS Solutions Architect Professional', 'Amazon Web Services', '2025-03-20', '2028-03-20', 'AWS-SAP-67890', 'https://aws.amazon.com/credentials/AWS-SAP-67890'),
    
    -- Sarah Kim's certifications
    ('00000000-0000-0000-0000-000000000002', 'Meta Certified Frontend Developer', 'Meta', '2025-08-10', NULL, 'META-FE-2025-001', 'https://meta.com/credentials/META-FE-2025-001'),
    ('00000000-0000-0000-0000-000000000002', 'React Advanced Certification', 'Meta', '2025-05-22', NULL, 'REACT-ADV-555', 'https://reactjs.org/certifications/REACT-ADV-555'),
    
    -- James Liu's certifications
    ('00000000-0000-0000-0000-000000000003', 'AWS Certified DevOps Engineer', 'Amazon Web Services', '2025-07-01', '2027-07-01', 'AWS-DEVOPS-111', 'https://aws.amazon.com/credentials/AWS-DEVOPS-111'),
    
    -- Priya Sharma's certifications
    ('00000000-0000-0000-0000-000000000004', 'Apple Certified iOS Developer', 'Apple', '2025-09-15', NULL, 'APPLE-IOS-2025-089', 'https://developer.apple.com/certifications/APPLE-IOS-2025-089'),
    ('00000000-0000-0000-0000-000000000004', 'Swift Language Specialist', 'Apple', '2025-04-10', NULL, 'SWIFT-SPEC-256', 'https://swift.org/certifications/SWIFT-SPEC-256'),
    
    -- Mike Johnson's certifications
    ('00000000-0000-0000-0000-000000000005', 'Netflix Cloud Architecture Certification', 'Netflix', '2025-10-01', NULL, 'NETFLIX-CA-777', 'https://netflix.com/tech/certifications/NETFLIX-CA-777'),
    ('00000000-0000-0000-0000-000000000005', 'Kubernetes Administrator (CKA)', 'Cloud Native Computing Foundation', '2025-06-20', '2027-06-20', 'CKA-2025-444', 'https://cncf.io/credentials/CKA-2025-444'),
    
    -- Emma Wilson's certifications
    ('00000000-0000-0000-0000-000000000006', 'Google Professional Software Engineer', 'Google', '2025-08-25', NULL, 'GPSE-2025-888', 'https://google.com/certifications/GPSE-2025-888'),
    
    -- David Lee's certifications
    ('00000000-0000-0000-0000-000000000007', 'Meta Mobile Development Certificate', 'Meta', '2025-07-15', NULL, 'META-MOB-333', 'https://meta.com/learning/certifications/META-MOB-333'),
    
    -- Lisa Brown's certifications
    ('00000000-0000-0000-0000-000000000008', 'AWS Certified SysOps Administrator', 'Amazon Web Services', '2025-05-30', '2027-05-30', 'AWS-SYSOPS-222', 'https://aws.amazon.com/credentials/AWS-SYSOPS-222'),
    
    -- Tom Harris's certifications
    ('00000000-0000-0000-0000-000000000009', 'Netflix Microservices Design Certificate', 'Netflix', '2025-11-01', NULL, 'NETFLIX-MS-555', 'https://netflix.com/tech/certifications/NETFLIX-MS-555'),
    
    -- Amy Zhang's certifications
    ('00000000-0000-0000-0000-000000000010', 'Apple Foundation Certification', 'Apple', '2025-12-01', NULL, 'APPLE-FOUND-111', 'https://developer.apple.com/certifications/APPLE-FOUND-111');

-- =============================================
-- COMPLETE!
-- =============================================
SELECT 'Demo data inserted successfully!' as status;

-- Verify the data
SELECT 'Profiles:' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Leaderboard:', COUNT(*) FROM leaderboard
UNION ALL
SELECT 'Badges:', COUNT(*) FROM badges
UNION ALL
SELECT 'Certifications:', COUNT(*) FROM certifications;

