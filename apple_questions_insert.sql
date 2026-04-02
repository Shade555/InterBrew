-- =============================================
-- Apple iOS Engineer Interview Questions Insert
-- Run this in your Supabase SQL Editor
-- =============================================

-- Get or create Apple challenge set
DO $$
DECLARE
    apple_cs_id UUID;
BEGIN
    -- Try to find existing Apple challenge set
    SELECT id INTO apple_cs_id FROM challenge_sets WHERE company = 'Apple' LIMIT 1;
    
    -- If not found, create it
    IF apple_cs_id IS NULL THEN
        INSERT INTO challenge_sets (company, title, description, time_limit)
        VALUES ('Apple', 'Apple iOS Engineer', 'iOS development and Swift questions', 30)
        RETURNING id INTO apple_cs_id;
    END IF;
    
    -- Insert Apple questions (adapted from user provided data)
    -- Converting correct_answer from full text to letter option
    INSERT INTO questions (challenge_set_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, category) VALUES
    (apple_cs_id, 'What is "ARC" in Apple development?', 'A drawing tool', 'Automatic Reference Counting', 'Advanced Real-time Code', 'Apple Remote Control', 'B', 'Apple''s memory management system for Swift and Objective-C.', 'Medium', 'Technical'),
    (apple_cs_id, 'Apple values "Simplicity." What does this mean for design?', 'Adding every feature', 'Removing unnecessary elements to focus on the core', 'Using black and white', 'Making things cheap', 'B', 'Focus on intuitive user experiences.', 'Easy', 'Behavioral'),
    (apple_cs_id, 'What is an "Optional" in Swift?', 'A button', 'A type that represents either a value or "nil"', 'An extra feature', 'A random number', 'B', 'Safe handling of missing values.', 'Medium', 'Technical'),
    (apple_cs_id, 'Why does Apple emphasize "On-device Machine Learning"?', 'It is faster for servers', 'User privacy and reduced latency', 'Cloud is too expensive', 'Siri requires it', 'B', 'Keeps sensitive data off the cloud.', 'Hard', 'System Design'),
    (apple_cs_id, 'In C++, what is a "Virtual Function"?', 'A function that does not exist', 'A function redefined in a derived class', 'A faster function', 'A global variable', 'B', 'Enables runtime polymorphism.', 'Hard', 'Technical'),
    (apple_cs_id, 'What is the "Main Thread" used for in iOS?', 'Network calls', 'Background processing', 'UI updates', 'Data storage', 'C', 'Updating the UI on a background thread causes crashes or lags.', 'Medium', 'Technical'),
    (apple_cs_id, 'Apple often says "No" to good ideas. Why?', 'They are mean', 'To focus only on the truly great ideas', 'To save money', 'To avoid competition', 'B', 'Curation and focus are core Apple principles.', 'Easy', 'Behavioral'),
    (apple_cs_id, 'What is "Metal" at Apple?', 'A laptop case', 'A high-performance graphics API', 'A music service', 'A security chip', 'B', 'Optimized for modern Apple GPUs.', 'Medium', 'Technical'),
    (apple_cs_id, 'What is the purpose of a "Guard" statement in Swift?', 'To prevent hacking', 'To exit a function early if conditions aren''t met', 'To start a loop', 'To define a variable', 'B', 'Improves code readability by avoiding nested "if" statements.', 'Easy', 'Technical'),
    (apple_cs_id, 'What is a "Struct" in Swift?', 'A class', 'A value type for storing data', 'A pointer', 'A function', 'B', 'Structs are copied when passed around, unlike classes.', 'Medium', 'Technical'),
    (apple_cs_id, 'What is "Sandbox" in iOS?', 'A testing environment', 'A security mechanism to isolate apps', 'A storage folder', 'A coding game', 'B', 'Ensures apps cannot access data from other apps without permission.', 'Medium', 'Technical'),
    (apple_cs_id, 'What is "End-to-End Encryption"?', 'Encrypting at the server', 'Only sender and receiver can read the messages', 'Changing passwords daily', 'Storing data in the cloud', 'B', 'A standard for privacy in iMessage.', 'Medium', 'System Design'),
    (apple_cs_id, 'What is the time complexity of accessing an array element by index?', 'O(1)', 'O(n)', 'O(log n)', 'O(n^2)', 'A', 'Direct memory access via index.', 'Easy', 'Technical'),
    (apple_cs_id, 'What is "Core Data"?', 'A processor', 'Apple''s framework for object-graph and persistence', 'A hard drive', 'A central server', 'B', 'Used for local data storage in apps.', 'Medium', 'Technical'),
    (apple_cs_id, 'What is an "Enum" in Swift?', 'A number', 'A group of related values in a type-safe way', 'An error code', 'A loop', 'B', 'Short for enumeration.', 'Easy', 'Technical'),
    (apple_cs_id, 'Apple values "Inclusion and Diversity." Why?', 'It looks good', 'To drive innovation with different perspectives', 'To follow laws', 'To sell more phones', 'B', 'Diverse teams build better products for everyone.', 'Easy', 'Behavioral'),
    (apple_cs_id, 'What is "Protocol-Oriented Programming" in Swift?', 'Writing internet protocols', 'Focusing on protocols/interfaces instead of classes', 'Using older code', 'A server setting', 'B', 'A key paradigm shift in modern Swift development.', 'Hard', 'Technical'),
    (apple_cs_id, 'What does the "static" keyword do in a Swift function?', 'Makes it run fast', 'Associates the function with the type rather than an instance', 'Deletes it from memory', 'Makes it private', 'B', 'Can be called on the type itself.', 'Medium', 'Technical'),
    (apple_cs_id, 'What is a "Closure" in Swift?', 'Ending a program', 'A self-contained block of functionality', 'A final class', 'An app icon', 'B', 'Similar to blocks or lambdas in other languages.', 'Medium', 'Technical'),
    (apple_cs_id, 'What is the time complexity of binary search on a sorted linked list?', 'O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'C', 'Because linked lists don''t have O(1) random access, binary search is inefficient.', 'Hard', 'Technical')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Apple questions inserted successfully!';
END $$;
