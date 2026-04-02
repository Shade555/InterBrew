-- =============================================
-- FIX RLS POLICIES - Run this to fix access issues
-- =============================================

-- =============================================
-- PROFILES - Make completely open for debugging
-- =============================================

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can upsert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can update profiles" ON profiles;
DROP POLICY IF EXISTS "public_access_profiles" ON profiles;

-- Create completely open policy for debugging
CREATE POLICY "open_profiles" ON profiles 
FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- COMPANIES - Make readable by everyone
-- =============================================

DROP POLICY IF EXISTS "Anyone can view companies" ON companies;
CREATE POLICY "open_companies" ON companies FOR SELECT USING (true);

-- =============================================
-- CHALLENGE_SETS - Make readable by everyone
-- =============================================

DROP POLICY IF EXISTS "Anyone can view challenge_sets" ON challenge_sets;
DROP POLICY IF EXISTS "public_access_challenge_sets" ON challenge_sets;
CREATE POLICY "open_challenge_sets" ON challenge_sets FOR SELECT USING (true);

-- =============================================
-- QUESTIONS - Make readable by everyone
-- =============================================

DROP POLICY IF EXISTS "Anyone can view questions" ON questions;
DROP POLICY IF EXISTS "public_access_questions" ON questions;
CREATE POLICY "open_questions" ON questions FOR SELECT USING (true);

-- =============================================
-- LEADERBOARD - Make readable by everyone
-- =============================================

DROP POLICY IF EXISTS "Public read leaderboard" ON leaderboard;
DROP POLICY IF EXISTS "public_access_leaderboard" ON leaderboard;
CREATE POLICY "open_leaderboard" ON leaderboard FOR SELECT USING (true);

-- =============================================
-- ATTEMPTS - Allow user access
-- =============================================

DROP POLICY IF EXISTS "Users can view own attempts" ON attempts;
DROP POLICY IF EXISTS "Users can insert attempts" ON attempts;
CREATE POLICY "open_attempts" ON attempts FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- ANSWERS - Allow user access
-- =============================================

DROP POLICY IF EXISTS "Users can view own answers" ON answers;
DROP POLICY IF EXISTS "Users can insert answers" ON answers;
CREATE POLICY "open_answers" ON answers FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

GRANT ALL ON profiles TO authenticated, anon, service_role;
GRANT ALL ON companies TO authenticated, anon, service_role;
GRANT ALL ON challenge_sets TO authenticated, anon, service_role;
GRANT ALL ON questions TO authenticated, anon, service_role;
GRANT ALL ON leaderboard TO authenticated, anon, service_role;
GRANT ALL ON attempts TO authenticated, anon, service_role;
GRANT ALL ON answers TO authenticated, anon, service_role;

SELECT 'RLS policies fixed! All tables are now accessible.' as status;
