-- =============================================
-- Meta SWE Interview Questions Insert
-- Run this in your Supabase SQL Editor
-- =============================================

-- Get or create Meta challenge set
DO $$
DECLARE
    meta_cs_id UUID;
BEGIN
    -- Try to find existing Meta challenge set
    SELECT id INTO meta_cs_id FROM challenge_sets WHERE company = 'Meta' LIMIT 1;
    
    -- If not found, create it
    IF meta_cs_id IS NULL THEN
        INSERT INTO challenge_sets (company, title, description, time_limit)
        VALUES ('Meta', 'Meta SWE Interview', 'Coding and system design questions for Meta SWE position', 30)
        RETURNING id INTO meta_cs_id;
    END IF;
    
    -- Insert Meta questions (adapted from user provided data)
    -- Converting correct_answer from full text to letter option
    INSERT INTO questions (challenge_set_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, category) VALUES
    (meta_cs_id, 'Which algorithm is most efficient for finding the shortest path between two people in a social network?', 'DFS', 'BFS', 'Linear Search', 'Binary Search', 'B', 'BFS finds the shortest path (fewest hops) in an unweighted graph.', 'Medium', 'Technical'),
    (meta_cs_id, 'How does Meta handle massive amounts of small image files (like profile pics)?', 'Standard HDD storage', 'Haystack Store', 'Email attachments', 'Single SQL table', 'B', 'Haystack is Meta''s specialized storage for minimizing disk I/O for photos.', 'Hard', 'System Design'),
    (meta_cs_id, 'What is the time complexity of finding an element in a Hash Map?', 'O(1) Average', 'O(log n)', 'O(n)', 'O(1) Worst Case', 'A', 'On average, hash maps provide constant time lookups.', 'Easy', 'Technical'),
    (meta_cs_id, 'Which tool did Facebook create to query large datasets using SQL-like syntax?', 'Hadoop', 'Hive', 'Postgres', 'Redis', 'B', 'Hive provides an SQL layer over Hadoop HDFS.', 'Medium', 'System Design'),
    (meta_cs_id, 'In React, what is the purpose of the "Virtual DOM"?', 'To bypass the browser', 'To minimize direct manipulation of the heavy real DOM', 'To store user passwords', 'To speed up the network', 'B', 'React calculates differences and updates only the necessary parts of the UI.', 'Medium', 'Technical'),
    (meta_cs_id, 'What does "Move Fast" mean at Meta?', 'Write messy code', 'Build and ship quickly to learn', 'Run in the office', 'Ignore safety', 'B', 'The goal is to iterate quickly based on user feedback.', 'Easy', 'Behavioral'),
    (meta_cs_id, 'Which data structure is best for implementing a "Friend Recommendation" system?', 'Stack', 'Adjacency List (Graph)', 'Queue', 'Array', 'B', 'Social networks are naturally modeled as graphs.', 'Medium', 'Technical'),
    (meta_cs_id, 'What is "Consistent Hashing" used for?', 'Password encryption', 'Distributing requests across a changing set of servers', 'Sorting data', 'Image compression', 'B', 'It minimizes data movement when nodes are added or removed.', 'Hard', 'System Design'),
    (meta_cs_id, 'What is a "Race Condition"?', 'A competition between developers', 'When the output depends on the timing of threads', 'A fast database query', 'A type of network cable', 'B', 'Unpredictable behavior when multiple threads access shared data.', 'Medium', 'Technical'),
    (meta_cs_id, 'What is the time complexity to insert into a Red-Black Tree?', 'O(1)', 'O(log n)', 'O(n)', 'O(n^2)', 'B', 'Red-Black trees remain balanced, ensuring logarithmic depth.', 'Hard', 'Technical'),
    (meta_cs_id, 'Which protocol is commonly used for mobile app-to-server communication?', 'FTP', 'SMTP', 'HTTPS', 'Telnet', 'C', 'Secure, standard protocol for web and mobile APIs.', 'Easy', 'System Design'),
    (meta_cs_id, 'What is "Memoization"?', 'Deleting old code', 'Caching the results of expensive function calls', 'Writing documentation', 'A sorting algorithm', 'B', 'Used in dynamic programming to avoid redundant work.', 'Medium', 'Technical'),
    (meta_cs_id, 'What is the difference between a Set and a List?', 'Sets allow duplicates', 'Sets are always sorted', 'Sets contain unique elements', 'Lists are faster', 'C', 'Sets ensure no two elements are the same.', 'Easy', 'Technical'),
    (meta_cs_id, 'At Meta, what is "Impact" focused on?', 'Line count of code', 'Solving problems that help people at scale', 'Working late', 'Number of meetings', 'B', 'Impact is about the value created for the community.', 'Easy', 'Behavioral'),
    (meta_cs_id, 'How do you detect a cycle in a Linked List?', 'Sort the list', 'Floyd''s Cycle-Finding Algorithm', 'Convert it to an array', 'Delete the head', 'B', 'Also known as the Tortoise and Hare approach.', 'Medium', 'Technical'),
    (meta_cs_id, 'What is "Throughput"?', 'The time it takes to finish one task', 'The number of tasks finished per second', 'The storage limit', 'The code quality', 'B', 'A measure of system capacity.', 'Medium', 'System Design'),
    (meta_cs_id, 'Which database is "Schema-less"?', 'MySQL', 'PostgreSQL', 'MongoDB', 'Oracle', 'C', 'MongoDB uses a BSON format that doesn''t require a strict schema.', 'Easy', 'Technical'),
    (meta_cs_id, 'What is a "Pointer" in C++?', 'A UI element', 'A variable that stores a memory address', 'A mathematical symbol', 'An error message', 'B', 'Pointers allow direct memory manipulation.', 'Easy', 'Technical'),
    (meta_cs_id, 'What is "Replication" in databases?', 'Deleting data', 'Storing the same data on multiple nodes', 'Splitting data into parts', 'Updating software', 'B', 'Increases availability and reliability.', 'Medium', 'System Design'),
    (meta_cs_id, 'What is the result of 10 % 3?', '3', '1', '0', '0.33', 'B', 'The modulo operator returns the remainder.', 'Easy', 'Technical')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Meta questions inserted successfully!';
END $$;

