-- =============================================
-- CHALLENGE TABLES SETUP
-- Run this in your Supabase SQL Editor
-- =============================================

-- =============================================
-- STEP 1: CREATE CHALLENGE SETS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS challenge_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    company TEXT NOT NULL,
    title TEXT,
    description TEXT,
    time_limit INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 2: CREATE QUESTIONS TABLE
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

-- =============================================
-- STEP 3: CREATE ATTEMPTS TABLE
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

-- =============================================
-- STEP 4: CREATE ANSWERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    attempt_id UUID REFERENCES attempts(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    selected_answer TEXT,
    is_correct BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 5: CREATE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_questions_challenge_set_id ON questions(challenge_set_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_challenge_set_id ON attempts(challenge_set_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON attempts(status);
CREATE INDEX IF NOT EXISTS idx_answers_attempt_id ON answers(attempt_id);

-- =============================================
-- STEP 6: ENABLE RLS
-- =============================================
ALTER TABLE challenge_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Policies for challenge_sets
DROP POLICY IF EXISTS "Anyone can view challenge_sets" ON challenge_sets;
CREATE POLICY "Anyone can view challenge_sets" ON challenge_sets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert challenge_sets" ON challenge_sets;
CREATE POLICY "Anyone can insert challenge_sets" ON challenge_sets FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update challenge_sets" ON challenge_sets;
CREATE POLICY "Anyone can update challenge_sets" ON challenge_sets FOR UPDATE USING (true);

-- Policies for questions
DROP POLICY IF EXISTS "Anyone can view questions" ON questions;
CREATE POLICY "Anyone can view questions" ON questions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert questions" ON questions;
CREATE POLICY "Anyone can insert questions" ON questions FOR INSERT WITH CHECK (true);

-- Policies for attempts (users can view their own)
DROP POLICY IF EXISTS "Users can view own attempts" ON attempts;
CREATE POLICY "Users can view own attempts" ON attempts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert attempts" ON attempts;
CREATE POLICY "Users can insert attempts" ON attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own attempts" ON attempts;
CREATE POLICY "Users can update own attempts" ON attempts FOR UPDATE USING (auth.uid() = user_id);

-- Policies for answers (users can view their own)
DROP POLICY IF EXISTS "Users can view own answers" ON answers;
CREATE POLICY "Users can view own answers" ON answers FOR SELECT USING (
    EXISTS (SELECT 1 FROM attempts WHERE attempts.id = answers.attempt_id AND attempts.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can insert answers" ON answers;
CREATE POLICY "Users can insert answers" ON answers FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM attempts WHERE attempts.id = answers.attempt_id AND attempts.user_id = auth.uid())
);

-- =============================================
-- STEP 7: INSERT SAMPLE CHALLENGE SETS AND QUESTIONS
-- =============================================
-- Insert challenge sets
INSERT INTO challenge_sets (company, title, description, time_limit) VALUES
('Meta', 'Meta SWE Interview', 'Coding and system design questions for Meta SWE position', 30),
('Amazon', 'Amazon SDE II Interview', 'Leadership principles and technical questions', 30),
('Netflix', 'Netflix System Design', 'System design and architecture questions', 30),
('Google', 'Google SWE L4 Interview', 'Algorithms and data structures', 30),
('Apple', 'Apple iOS Engineer', 'iOS development and Swift questions', 30)
ON CONFLICT DO NOTHING;

-- Get Meta challenge set ID and insert questions
DO $$
DECLARE
    meta_cs_id UUID;
    amazon_cs_id UUID;
    netflix_cs_id UUID;
    google_cs_id UUID;
    apple_cs_id UUID;
BEGIN
    SELECT id INTO meta_cs_id FROM challenge_sets WHERE company = 'Meta' LIMIT 1;
    SELECT id INTO amazon_cs_id FROM challenge_sets WHERE company = 'Amazon' LIMIT 1;
    SELECT id INTO netflix_cs_id FROM challenge_sets WHERE company = 'Netflix' LIMIT 1;
    SELECT id INTO google_cs_id FROM challenge_sets WHERE company = 'Google' LIMIT 1;
    SELECT id INTO apple_cs_id FROM challenge_sets WHERE company = 'Apple' LIMIT 1;

    -- Meta Questions
    IF meta_cs_id IS NOT NULL THEN
        INSERT INTO questions (challenge_set_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, category) VALUES
        (meta_cs_id, 'What is the time complexity of finding an element in a hash map?', 'O(n)', 'O(log n)', 'O(1)', 'O(n²)', 'C', 'Hash maps offer O(1) average-case lookup.', 'easy', 'coding'),
        (meta_cs_id, 'Which data structure does React''s virtual DOM primarily resemble?', 'Stack', 'Queue', 'Tree', 'Graph', 'C', 'React''s Virtual DOM is a tree structure.', 'easy', 'coding'),
        (meta_cs_id, 'In a binary search tree, in-order traversal gives elements in which order?', 'Random', 'Descending', 'Ascending', 'Level order', 'C', 'In-order traversal gives sorted ascending order.', 'medium', 'coding'),
        (meta_cs_id, 'Space complexity of recursive DFS on a graph with V vertices?', 'O(1)', 'O(V)', 'O(V²)', 'O(E)', 'B', 'DFS uses a call stack proportional to depth.', 'medium', 'coding'),
        (meta_cs_id, 'Which algorithm finds shortest path in an unweighted graph?', 'Dijkstra''s', 'BFS', 'DFS', 'Bellman-Ford', 'B', 'BFS finds shortest path in unweighted graphs.', 'easy', 'coding')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Amazon Questions
    IF amazon_cs_id IS NOT NULL THEN
        INSERT INTO questions (challenge_set_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, category) VALUES
        (amazon_cs_id, 'Time complexity of merge sort?', 'O(n)', 'O(n log n)', 'O(n²)', 'O(log n)', 'B', 'Merge sort is O(n log n).', 'easy', 'coding'),
        (amazon_cs_id, 'What does FIFO stand for in Amazon SQS?', 'First In First Out', 'Fast Input Fast Output', 'File In File Out', 'First Index First Output', 'A', 'FIFO ensures order.', 'easy', 'system'),
        (amazon_cs_id, 'Best sorting algorithm for nearly sorted data?', 'Quick Sort', 'Merge Sort', 'Insertion Sort', 'Heap Sort', 'C', 'Insertion sort is O(n) on nearly sorted.', 'medium', 'coding'),
        (amazon_cs_id, 'What triggers a Lambda ''cold start''?', 'Every call', 'First call or after inactivity', 'Memory overflow', 'Timeout', 'B', 'Cold starts happen on first call or after inactivity.', 'medium', 'system'),
        (amazon_cs_id, 'Best data structure for a priority queue?', 'Array', 'Linked List', 'Heap', 'Stack', 'C', 'Heap provides O(log n) insert.', 'medium', 'coding')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Netflix Questions
    IF netflix_cs_id IS NOT NULL THEN
        INSERT INTO questions (challenge_set_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, category) VALUES
        (netflix_cs_id, 'Which pattern handles microservice failures gracefully?', 'Retry loop', 'Circuit Breaker', 'Load Balancer', 'Caching', 'B', 'Circuit Breaker stops cascading failures.', 'medium', 'system'),
        (netflix_cs_id, 'Output of [1,2,3].reduce((acc,val)=>acc+val,0)?', '6', '0', '123', 'Error', 'A', 'reduce accumulates: 0+1+2+3=6.', 'easy', 'coding'),
        (netflix_cs_id, 'Which HTTP method is idempotent?', 'POST', 'PUT', 'PATCH', 'None', 'B', 'PUT is idempotent.', 'easy', 'system'),
        (netflix_cs_id, 'A/B testing at scale requires which concept?', 'Monolithic arch', 'Feature flags', 'Sync APIs only', 'Single DB', 'B', 'Feature flags enable experiments.', 'medium', 'system'),
        (netflix_cs_id, 'What does REST stand for?', 'Remote Execution State Transfer', 'Representational State Transfer', 'Resource State Transaction', 'Remote Endpoint Service Transfer', 'B', 'REST = Representational State Transfer.', 'easy', 'system')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Google Questions
    IF google_cs_id IS NOT NULL THEN
        INSERT INTO questions (challenge_set_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, category) VALUES
        (google_cs_id, 'Time complexity of binary search?', 'O(n)', 'O(n²)', 'O(log n)', 'O(1)', 'C', 'Binary search halves the search space.', 'easy', 'coding'),
        (google_cs_id, 'What does ''memoization'' mean in dynamic programming?', 'Storing results to avoid recomputation', 'Deleting old cache', 'Sorting data', 'Parallel processing', 'A', 'Memoization caches results.', 'medium', 'coding'),
        (google_cs_id, 'A trie is most efficient for?', 'Sorting numbers', 'Prefix-based string search', 'Graph traversal', 'Heap operations', 'B', 'Tries excel at prefix searches.', 'medium', 'coding'),
        (google_cs_id, 'PageRank assigns higher rank to pages with?', 'More images', 'More inbound links from high-ranked pages', 'Faster load', 'More text', 'B', 'PageRank is iterative.', 'hard', 'system'),
        (google_cs_id, 'MapReduce processes data in which two phases?', 'Read & Write', 'Map & Reduce', 'Filter & Sort', 'Split & Merge', 'B', 'MapReduce: Map and Reduce phases.', 'easy', 'system')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Apple Questions
    IF apple_cs_id IS NOT NULL THEN
        INSERT INTO questions (challenge_set_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, category) VALUES
        (apple_cs_id, 'Swift uses which memory management system?', 'Manual', 'Garbage collection', 'ARC (Automatic Reference Counting)', 'Reference counting only', 'C', 'Swift uses ARC.', 'easy', 'coding'),
        (apple_cs_id, 'What is a closure in Swift?', 'A loop construct', 'A self-contained block capturing context', 'A class method', 'A type alias', 'B', 'Closures capture surrounding context.', 'medium', 'coding'),
        (apple_cs_id, 'Core Data in iOS is primarily used for?', 'Network requests', 'Local data persistence', 'UI rendering', 'Authentication', 'B', 'Core Data is for local persistence.', 'easy', 'system'),
        (apple_cs_id, 'Purpose of @escaping in Swift closures?', 'Makes it faster', 'Allows closure to outlive the function', 'Prevents capturing', 'Makes it optional', 'B', '@escaping allows storage.', 'medium', 'coding'),
        (apple_cs_id, 'UIKit''s MVC stands for?', 'Model-View-Controller', 'Model-View-Component', 'Module-View-Container', 'Memory-View-Cache', 'A', 'MVC separates data, UI, logic.', 'easy', 'system')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

