-- =============================================
-- Amazon Leadership Principles & Technical Interview Questions Insert
-- Run this in your Supabase SQL Editor
-- =============================================

-- Get or create Amazon challenge set
DO $$
DECLARE
    amazon_cs_id UUID;
BEGIN
    -- Try to find existing Amazon challenge set
    SELECT id INTO amazon_cs_id FROM challenge_sets WHERE company = 'Amazon' LIMIT 1;
    
    -- If not found, create it
    IF amazon_cs_id IS NULL THEN
        INSERT INTO challenge_sets (company, title, description, time_limit)
        VALUES ('Amazon', 'Amazon SDE II Interview', 'Leadership principles and technical questions', 30)
        RETURNING id INTO amazon_cs_id;
    END IF;
    
    -- Insert Amazon questions (adapted from user provided data)
    -- Converting correct_answer from full text to letter option
    INSERT INTO questions (challenge_set_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, category) VALUES
    (amazon_cs_id, 'What is Amazon''s #1 Leadership Principle?', 'Frugality', 'Customer Obsession', 'Ownership', 'Think Big', 'B', 'Leaders start with the customer and work backwards.', 'Easy', 'Behavioral'),
    (amazon_cs_id, 'What is the time complexity of searching an element in a balanced BST?', 'O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'B', 'Balanced height allows logarithmic search.', 'Easy', 'Technical'),
    (amazon_cs_id, 'What is the "Two-Pizza Team" rule?', 'Teams should eat more pizza', 'Teams should be small enough to be fed by two pizzas', 'Two teams should work together', 'Project budget for food', 'B', 'Amazon believes small teams are more efficient and agile.', 'Easy', 'System Design'),
    (amazon_cs_id, 'Which AWS service provides resizable compute capacity?', 'S3', 'Lambda', 'EC2', 'Redshift', 'C', 'Elastic Compute Cloud.', 'Easy', 'Technical'),
    (amazon_cs_id, 'What does "Bias for Action" mean?', 'Acting without thinking', 'Speed matters in business; many decisions are reversible', 'Ignoring data', 'Working on weekends', 'B', 'Calculated risk-taking is encouraged.', 'Medium', 'Behavioral'),
    (amazon_cs_id, 'Which database type is Amazon Aurora?', 'NoSQL', 'Relational (SQL)', 'Graph', 'Key-Value', 'B', 'High-performance MySQL and PostgreSQL compatible database.', 'Medium', 'System Design'),
    (amazon_cs_id, 'What is the "Stable Marriage Problem" related to?', 'Matching elements in two sets based on preference', 'Database sharding', 'Memory leaks', 'UI Design', 'A', 'A classic algorithm often discussed in matching markets.', 'Hard', 'Technical'),
    (amazon_cs_id, 'What is "In-place" sorting?', 'Sorting in a different array', 'Sorting without extra memory proportional to input', 'Sorting only numbers', 'Sorting very fast', 'B', 'Uses O(1) or O(log n) extra space.', 'Medium', 'Technical'),
    (amazon_cs_id, 'What does "Frugality" mean at Amazon?', 'Being cheap', 'Accomplishing more with less', 'Not hiring people', 'Using old computers', 'B', 'Constraints breed resourcefulness, self-sufficiency, and invention.', 'Easy', 'Behavioral'),
    (amazon_cs_id, 'Which sorting algorithm is stable?', 'QuickSort', 'MergeSort', 'HeapSort', 'Selection Sort', 'B', 'Stable sorts preserve the relative order of equal elements.', 'Medium', 'Technical'),
    (amazon_cs_id, 'What is "S3" primarily used for?', 'Running code', 'Object storage', 'Relational data', 'Gaming', 'B', 'Simple Storage Service for files, images, and backups.', 'Easy', 'System Design'),
    (amazon_cs_id, 'In SQL, what does "GROUP BY" do?', 'Deletes data', 'Aggregates rows based on a column', 'Sorts the whole table', 'Changes column names', 'B', 'Used with functions like SUM, COUNT, and AVG.', 'Medium', 'Technical'),
    (amazon_cs_id, 'What is a "Hash Collision"?', 'When a hash map crashes', 'When two keys produce the same hash value', 'A network error', 'A slow query', 'B', 'Handled by chaining or open addressing.', 'Medium', 'Technical'),
    (amazon_cs_id, 'What does it mean to "Dive Deep"?', 'Going swimming', 'Staying connected to the details and auditing frequently', 'Working long hours', 'Writing complex code', 'B', 'Leaders operate at all levels and don''t overlook small details.', 'Medium', 'Behavioral'),
    (amazon_cs_id, 'What is the "Merge" step in MergeSort?', 'Splitting the array', 'Combining two sorted subarrays into one sorted array', 'Deleting duplicates', 'Choosing a pivot', 'B', 'The core of the divide-and-conquer approach.', 'Easy', 'Technical'),
    (amazon_cs_id, 'What is "Inheritance" in OOP?', 'Getting money', 'A mechanism where one class acquires properties of another', 'A error type', 'A way to delete objects', 'B', 'Promotes code reusability.', 'Easy', 'Technical'),
    (amazon_cs_id, 'What is a "Web Hook"?', 'A type of virus', 'A way for an app to provide real-time info to other apps', 'A browser button', 'A coding standard', 'B', 'User-defined HTTP callbacks.', 'Medium', 'System Design'),
    (amazon_cs_id, 'What is the time complexity of a Bubble Sort?', 'O(n)', 'O(n^2)', 'O(log n)', 'O(n log n)', 'B', 'Involves nested loops comparing adjacent elements.', 'Easy', 'Technical'),
    (amazon_cs_id, 'What is "Garbage Collection"?', 'Deleting code', 'Automatic memory management to reclaim unused objects', 'Cleaning the office', 'Refreshing the cache', 'B', 'Prevents memory leaks in languages like Java/C#.', 'Easy', 'Technical'),
    (amazon_cs_id, 'What is an "Interface" in Java?', 'A UI screen', 'A blueprint of a class that defines methods without bodies', 'A main method', 'A private class', 'B', 'Defines a contract for what a class can do.', 'Medium', 'Technical')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Amazon questions inserted successfully!';
END $$;

