-- =============================================
-- Netflix System Design Interview Questions Insert
-- Run this in your Supabase SQL Editor
-- =============================================

-- Get or create Netflix challenge set
DO $$
DECLARE
    netflix_cs_id UUID;
BEGIN
    -- Try to find existing Netflix challenge set
    SELECT id INTO netflix_cs_id FROM challenge_sets WHERE company = 'Netflix' LIMIT 1;
    
    -- If not found, create it
    IF netflix_cs_id IS NULL THEN
        INSERT INTO challenge_sets (company, title, description, time_limit)
        VALUES ('Netflix', 'Netflix System Design', 'System design and architecture questions', 30)
        RETURNING id INTO netflix_cs_id;
    END IF;
    
    -- Insert Netflix questions (adapted from user provided data)
    -- Converting correct_answer from full text to letter option
    INSERT INTO questions (challenge_set_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, category) VALUES
    (netflix_cs_id, 'Why does Netflix use "Microservices" instead of a Monolith?', 'It is cheaper', 'Better scalability and independent deployment', 'Easier to write code', 'Security', 'B', 'Allows teams to work on streaming, billing, and recommendations separately.', 'Medium', 'System Design'),
    (netflix_cs_id, 'What is the purpose of "Chaos Monkey" at Netflix?', 'To write tests', 'To randomly disable production services', 'To monitor employees', 'To compress video', 'B', 'It ensures engineers build systems that can survive failures.', 'Hard', 'Technical'),
    (netflix_cs_id, 'What does "Context, Not Control" mean at Netflix?', 'Micro-managing', 'Giving employees info to make decisions themselves', 'Hiding information', 'Only managers decide', 'B', 'Netflix trusts senior talent to act in the company''s best interest.', 'Easy', 'Behavioral'),
    (netflix_cs_id, 'What is the primary goal of a CDN?', 'Data backup', 'Low latency content delivery', 'Password security', 'Sending emails', 'B', 'CDNs store content closer to the user.', 'Easy', 'System Design'),
    (netflix_cs_id, 'What is "Hystrix" used for in microservices?', 'Database', 'Circuit breaking and fault tolerance', 'User Interface', 'Encryption', 'B', 'It prevents a failure in one service from cascading to others.', 'Hard', 'Technical'),
    (netflix_cs_id, 'Netflix values "Stunning Colleagues." What does this mean?', 'They dress well', 'High performance and high talent density', 'They are famous', 'They work for free', 'B', 'Netflix aims to only hire the top percentage of talent.', 'Easy', 'Behavioral'),
    (netflix_cs_id, 'Which compression format is heavily used for video streaming?', 'JPEG', 'H.264 / AVC', 'PDF', 'MP3', 'B', 'Industry standard for high-quality video compression.', 'Easy', 'Technical'),
    (netflix_cs_id, 'What is "Auto-scaling"?', 'Manually adding servers', 'Automatically adjusting resources based on load', 'Deleting old code', 'Resizing images', 'B', 'Essential for handling spikes in Netflix viewing (like Friday nights).', 'Medium', 'System Design'),
    (netflix_cs_id, 'What is the time complexity of a Binary Search?', 'O(1)', 'O(log n)', 'O(n)', 'O(n^2)', 'B', 'Divides the search space in half each step.', 'Easy', 'Technical'),
    (netflix_cs_id, 'In Java, what does "static" mean?', 'Variable changes often', 'The member belongs to the class, not an instance', 'It is a private variable', 'The program cannot run', 'B', 'Shared across all objects of the class.', 'Medium', 'Technical'),
    (netflix_cs_id, 'What is a "Reverse Proxy"?', 'A user-side tool', 'A server that forwards requests to backend servers', 'A type of firewall', 'A cloud storage', 'B', 'Useful for load balancing and security.', 'Medium', 'System Design'),
    (netflix_cs_id, 'What is the primary use of a "Queue"?', 'LIFO processing', 'FIFO processing', 'Random access', 'Storing constants', 'B', 'First-In, First-Out.', 'Easy', 'Technical'),
    (netflix_cs_id, 'What is "Multithreading"?', 'Using many computers', 'Concurrent execution of two or more parts of a program', 'Writing code in two languages', 'Using two monitors', 'B', 'Allows better CPU utilization.', 'Medium', 'Technical'),
    (netflix_cs_id, 'What is the "Culture Memo" at Netflix?', 'A secret document', 'A public document defining company values', 'A list of rules', 'A marketing flyer', 'B', 'It outlines the philosophy of Freedom and Responsibility.', 'Easy', 'Behavioral'),
    (netflix_cs_id, 'Which data structure is used for a Breadth-First Search?', 'Stack', 'Queue', 'Heap', 'Tree', 'B', 'Used to keep track of nodes to visit next.', 'Easy', 'Technical'),
    (netflix_cs_id, 'What is "Latency"?', 'The amount of data moved', 'The time delay in a system', 'The cost of a server', 'The number of users', 'B', 'Netflix aims for sub-second latency for UI interactions.', 'Easy', 'System Design'),
    (netflix_cs_id, 'What is a "Primary Key"?', 'A secure password', 'A unique identifier for a database record', 'The first line of code', 'A hardware key', 'B', 'Ensures each row can be uniquely addressed.', 'Easy', 'Technical'),
    (netflix_cs_id, 'What is "Docker"?', 'A programming language', 'A containerization platform', 'A database', 'A text editor', 'B', 'Allows packaging apps with their dependencies.', 'Medium', 'Technical'),
    (netflix_cs_id, 'What is an "API Gateway"?', 'A physical door', 'A single entry point for all client requests', 'A cloud storage', 'A video player', 'B', 'Manages authentication, routing, and rate limiting.', 'Medium', 'System Design'),
    (netflix_cs_id, 'What is the difference between TCP and UDP?', 'TCP is faster', 'TCP is reliable/connection-oriented; UDP is faster/lossy', 'UDP is for websites', 'TCP is for gaming only', 'B', 'Netflix uses TCP for control signals and often UDP-based protocols for streaming.', 'Medium', 'Technical')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Netflix questions inserted successfully!';
END $$;

