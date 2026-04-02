-- =============================================
-- Google SWE Interview Questions Insert
-- Run this in your Supabase SQL Editor
-- =============================================

-- Get or create Google challenge set
DO $$
DECLARE
    google_cs_id UUID;
BEGIN
    -- Try to find existing Google challenge set
    SELECT id INTO google_cs_id FROM challenge_sets WHERE company = 'Google' LIMIT 1;
    
    -- If not found, create it
    IF google_cs_id IS NULL THEN
        INSERT INTO challenge_sets (company, title, description, time_limit)
        VALUES ('Google', 'Google SWE L4 Interview', 'Algorithms and data structures', 30)
        RETURNING id INTO google_cs_id;
    END IF;
    
    -- Insert Google questions (adapted from user provided data)
    -- Converting correct_answer from full text to letter option
    INSERT INTO questions (challenge_set_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, category) VALUES
    (google_cs_id, 'What is the worst-case time complexity of QuickSort?', 'O(n log n)', 'O(n^2)', 'O(n)', 'O(log n)', 'B', 'Worst case occurs when the pivot is the smallest or largest element repeatedly.', 'Medium', 'Technical'),
    (google_cs_id, 'Which data structure is best for implementing a find-and-replace feature in a large text document?', 'Singly Linked List', 'Trie', 'Suffix Tree', 'Stack', 'C', 'Suffix trees allow for linear time pattern matching in a text.', 'Hard', 'Technical'),
    (google_cs_id, 'In a Binary Search Tree, which traversal produces a sorted list?', 'Pre-order', 'In-order', 'Post-order', 'Level-order', 'B', 'In-order traversal visits nodes in non-decreasing order.', 'Easy', 'Technical'),
    (google_cs_id, 'What is the purpose of Google''s BigTable?', 'Relational storage', 'Wide-column NoSQL storage', 'Graph processing', 'Audio encoding', 'B', 'BigTable is a distributed storage system for managing structured data at scale.', 'Hard', 'System Design'),
    (google_cs_id, 'What is the space complexity of a Breadth-First Search (BFS) on a graph?', 'O(1)', 'O(V)', 'O(E)', 'O(log V)', 'B', 'In the worst case, the queue holds all vertices at the maximum breadth.', 'Medium', 'Technical'),
    (google_cs_id, 'What does "Googliness" primarily measure?', 'Coding speed', 'Intellectual humility and bias to action', 'Years of experience', 'College GPA', 'B', 'Google looks for people who can lead, follow, and learn in ambiguous situations.', 'Easy', 'Behavioral'),
    (google_cs_id, 'How many edges are in a complete graph with n vertices?', 'n', 'n-1', 'n(n-1)/2', 'n^2', 'C', 'Every vertex connects to every other vertex exactly once.', 'Medium', 'Technical'),
    (google_cs_id, 'What is "Sharding" in a distributed database?', 'Backing up data', 'Horizontal partitioning of data', 'Vertical partitioning of columns', 'Encrypting data', 'B', 'Sharding splits a large dataset across multiple machines.', 'Medium', 'System Design'),
    (google_cs_id, 'Which algorithm is used by Google Maps to find the shortest path?', 'Prim''s', 'Kruskal''s', 'Dijkstra''s', 'Floyd-Warshall', 'C', 'Dijkstra''s algorithm finds the shortest path between nodes in a graph.', 'Medium', 'Technical'),
    (google_cs_id, 'What is the time complexity of inserting a value into a Max-Heap?', 'O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'B', 'The element may need to "bubble up" to the height of the tree.', 'Easy', 'Technical'),
    (google_cs_id, 'What is a "Deadlock" in OS?', 'A fast process', 'A state where processes wait forever for each other', 'A memory leak', 'A crashed server', 'B', 'Occurs when processes hold resources while waiting for others held by peers.', 'Medium', 'Technical'),
    (google_cs_id, 'Which data structure uses LIFO?', 'Queue', 'Stack', 'Array', 'Heap', 'B', 'Last-In, First-Out (LIFO).', 'Easy', 'Technical'),
    (google_cs_id, 'What is the advantage of a Skip List over a Linked List?', 'Less memory', 'O(log n) search time', 'Easier implementation', 'O(1) search time', 'B', 'Skip lists use multiple layers of pointers to "skip" nodes.', 'Hard', 'Technical'),
    (google_cs_id, 'What is a Load Balancer?', 'A type of database', 'A device that distributes traffic across servers', 'A memory management tool', 'A code compiler', 'B', 'It prevents any single server from becoming a bottleneck.', 'Easy', 'System Design'),
    (google_cs_id, 'What does ACID stand for in databases?', 'Accuracy, Cost, Identity, Durability', 'Atomicity, Consistency, Isolation, Durability', 'Access, Control, Internal, Data', 'Always, Correct, In, Design', 'B', 'These properties ensure reliable database transactions.', 'Medium', 'Technical'),
    (google_cs_id, 'What is the time complexity of merging two sorted arrays of size n and m?', 'O(n*m)', 'O(n+m)', 'O(log n)', 'O(1)', 'B', 'You traverse each element of both arrays exactly once.', 'Easy', 'Technical'),
    (google_cs_id, 'Which problem is NP-Complete?', 'Sorting an array', 'Binary search', 'Traveling Salesperson Problem', 'Finding the max value', 'C', 'TSP is a classic NP-Hard/NP-Complete optimization problem.', 'Hard', 'Technical'),
    (google_cs_id, 'What is "Paging" in Memory Management?', 'Scrolling a website', 'Dividing physical memory into fixed-size blocks', 'Organizing files in a folder', 'Clearing the cache', 'B', 'Paging eliminates external fragmentation.', 'Medium', 'Technical'),
    (google_cs_id, 'If you are stuck on a hard problem at Google, what should you do first?', 'Quit', 'Ask a teammate for a 15-minute sync', 'Wait for someone to notice', 'Restart your computer', 'B', 'Collaboration and unblocking yourself efficiently is valued.', 'Easy', 'Behavioral'),
    (google_cs_id, 'What is the height of a balanced BST with n nodes?', 'n', 'sqrt(n)', 'log n', 'n^2', 'C', 'Logarithmic height ensures efficient operations.', 'Easy', 'Technical')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Google questions inserted successfully!';
END $$;

