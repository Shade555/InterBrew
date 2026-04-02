// Auto-generated question bank for Phase 1
export const manifest = {
  meta: {
    examId: 'phase1_2026_03',
    title: 'FAANG Mock Interview — Phase 1',
    durationMinutes: 180,
    totalMarks: 300,
  },
  coding: {
    totalMarks: 150,
    problems: [
      {
        id: 'prob_001',
        title: 'Two Sum',
        difficulty: 'Easy',
        tags: ['Array', 'HashMap'],
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
        constraints: '2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9',
        examples: [
          { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9' }
        ],
        tests: [
          { input: [[2,7,11,15], 9], expected: [0,1] },
          { input: [[3,2,4], 6], expected: [1,2] },
          { input: [[3,3], 6], expected: [0,1] }
        ],
        timeComplexityExpected: 'O(n)',
        spaceComplexityExpected: 'O(n)',
        marks: 15,
      },
      {
        id: 'prob_002',
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        tags: ['Stack', 'String'],
        description: 'Given a string s containing just the characters ( ) { } [ ], determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets, and open brackets are closed in the correct order.',
        constraints: '1 <= s.length <= 10^4',
        examples: [ { input: 's = "()"', output: 'true' } ],
        tests: [
          { input: ['()'], expected: true },
          { input: ['()[]{}'], expected: true },
          { input: ['(]'], expected: false }
        ],
        timeComplexityExpected: 'O(n)',
        spaceComplexityExpected: 'O(n)',
        marks: 10,
      },
      {
        id: 'prob_003',
        title: 'Merge Intervals',
        difficulty: 'Easy',
        tags: ['Intervals', 'Sorting'],
        description: 'Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
        constraints: '1 <= intervals.length <= 10^4',
        examples: [ { input: '[[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' } ],
        tests: [
          { input: [[[1,3],[2,6],[8,10],[15,18]]], expected: [[1,6],[8,10],[15,18]] },
          { input: [[[1,4],[4,5]]], expected: [[1,5]] },
          { input: [[[1,4]]], expected: [[1,4]] }
        ],
        timeComplexityExpected: 'O(n log n)',
        spaceComplexityExpected: 'O(n)',
        marks: 10,
      },
      {
        id: 'prob_004',
        title: 'LRU Cache',
        difficulty: 'Medium',
        tags: ['Design', 'HashMap', 'DoublyLinkedList'],
        description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement get and put operations.',
        constraints: '0 <= capacity <= 3000',
        examples: [ { input: 'operations example', output: 'expected outputs' } ],
        tests: [
          { input: [['LRUCache', 'put', 'put', 'get', 'put', 'get', 'get'], [[2],[1,1],[2,2],[1],[3,3],[2],[3]]], expected: [null,null,null,1,null,-1,3] },
          { input: [['LRUCache', 'put', 'get'], [[1],[1,1],[1]]], expected: [null,null,1] }
        ],
        timeComplexityExpected: 'O(1) per operation',
        spaceComplexityExpected: 'O(capacity)',
        marks: 15,
      },
      {
        id: 'prob_005',
        title: 'Word Search',
        difficulty: 'Medium',
        tags: ['DFS', 'Backtracking'],
        description: 'Given an m x n board and a word, return true if the word exists in the grid. The word can be constructed from letters of sequentially adjacent cells.',
        constraints: '1 <= m, n <= 6',
        examples: [ { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: 'true' } ],
        tests: [
          { input: [[[['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], 'ABCCED']], expected: true },
          { input: [[[['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], 'SEE']], expected: true },
          { input: [[[['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], 'ABCB']], expected: false }
        ],
        timeComplexityExpected: 'O(m*n*4^L)',
        spaceComplexityExpected: 'O(L)',
        marks: 15,
      },
      {
        id: 'prob_006',
        title: 'Median of Two Sorted Arrays',
        difficulty: 'Hard',
        tags: ['BinarySearch', 'DivideAndConquer'],
        description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
        constraints: '0 <= m, n <= 10^6',
        examples: [ { input: 'nums1 = [1,3], nums2 = [2]', output: '2.0' } ],
        tests: [
          { input: [[1,3],[2]], expected: 2.0 },
          { input: [[1,2],[3,4]], expected: 2.5 },
          { input: [[0,0],[0,0]], expected: 0.0 }
        ],
        timeComplexityExpected: 'O(log(min(m,n)))',
        spaceComplexityExpected: 'O(1)',
        marks: 20,
      },
      {
        id: 'prob_007',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        tags: ['String', 'SlidingWindow'],
        description: 'Given a string s, find the length of the longest substring without repeating characters.',
        constraints: '0 <= s.length <= 5 * 10^4',
        examples: [ { input: '"abcabcbb"', output: '3' } ],
        tests: [
          { input: ['abcabcbb'], expected: 3 },
          { input: ['bbbbb'], expected: 1 },
          { input: ['pwwkew'], expected: 3 }
        ],
        timeComplexityExpected: 'O(n)',
        spaceComplexityExpected: 'O(min(n,charset))',
        marks: 15,
      },
      {
        id: 'prob_008',
        title: 'Find Peak Element',
        difficulty: 'Medium',
        tags: ['BinarySearch'],
        description: 'A peak element is an element that is strictly greater than its neighbors. Given an integer array nums, find a peak element and return its index. The array may contain multiple peaks; return the index to any of the peaks.',
        constraints: '1 <= nums.length <= 10^5',
        examples: [ { input: '[1,2,3,1]', output: '2' } ],
        tests: [
          { input: [[1,2,3,1]], expected: 2 },
          { input: [[1,2,1,3,5,6,4]], expected: 1 },
          { input: [[1]], expected: 0 }
        ],
        timeComplexityExpected: 'O(log n)',
        spaceComplexityExpected: 'O(1)',
        marks: 10,
      },
      {
        id: 'prob_009',
        title: 'Word Ladder',
        difficulty: 'Hard',
        tags: ['BFS', 'Graph'],
        description: 'Given two words beginWord and endWord, and a dictionary wordList, return the length of the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists.',
        constraints: '1 <= wordList.length <= 5000',
        examples: [ { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5' } ],
        tests: [
          { input: ['hit','cog',['hot','dot','dog','lot','log','cog']], expected: 5 },
          { input: ['hit','cog',['hot','dot','dog','lot','log']], expected: 0 },
          { input: ['a','c',['a','b','c']], expected: 2 }
        ],
        timeComplexityExpected: 'O(M*N*26)',
        spaceComplexityExpected: 'O(N)',
        marks: 20,
      },
      {
        id: 'prob_010',
        title: 'Minimum Window Substring',
        difficulty: 'Hard',
        tags: ['String', 'SlidingWindow'],
        description: 'Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return an empty string.',
        constraints: '1 <= m, n <= 10^5',
        examples: [ { input: 's = "ADOBECODEBANC", t = "ABC"', output: 'BANC' } ],
        tests: [
          { input: ['ADOBECODEBANC','ABC'], expected: 'BANC' },
          { input: ['a','a'], expected: 'a' },
          { input: ['a','aa'], expected: '' }
        ],
        timeComplexityExpected: 'O(m+n)',
        spaceComplexityExpected: 'O(1)',
        marks: 20,
      }
    ]
  },
  aptitude: {
    totalMarks: 100,
    quantitative: {
      marks: 40,
      questions: [
        { id: 'apt_q_001', text: 'A train travels 360 km in 4 hours. What is its speed in m/s?', options: ['25 m/s', '90 m/s', '100 m/s', '72 m/s'], answer: '25 m/s', explanation: 'Speed = 360km/4h = 90km/h = 90×(1000/3600) = 25 m/s', marks: 4, subsection: 'quantitative' },
        { id: 'apt_q_002', text: 'If 15% of a number is 60, what is the number?', options: ['300','400','450','350'], answer: '400', explanation: '0.15x = 60 => x=60/0.15 = 400', marks: 4, subsection: 'quantitative' },
        { id: 'apt_q_003', text: 'A shopkeeper sells an article for $240 after giving a 20% discount. What is the marked price?', options: ['$300','$320','$280','$260'], answer: '$300', explanation: 'Let MP = x; after 20% discount price = 0.8x = 240 => x=300', marks: 4, subsection: 'quantitative' },
        { id: 'apt_q_004', text: 'If a:b = 3:4 and b:c = 5:6, what is a:c?', options: ['15:24','9:8','10:9','3:2'], answer: '15:24', explanation: 'a:b=3:4, b:c=5:6 => scale to common b: 3:4 and 4*5:4*6 -> a=15, c=24', marks: 4, subsection: 'quantitative' },
        { id: 'apt_q_005', text: 'If 5 workers can complete a job in 12 days, how many workers needed to finish in 8 days?', options: ['7.5','6','8','10'], answer: '7.5', explanation: 'Work ∝ workers×days; workers=5×12/8=7.5', marks: 4, subsection: 'quantitative' },
        { id: 'apt_q_006', text: 'Solve for x: 2x + 5 = 17', options: ['6','5','7','4'], answer: '6', explanation: '2x=12 => x=6', marks: 4, subsection: 'quantitative' },
        { id: 'apt_q_007', text: 'What is 20% of 450?', options: ['90','80','100','85'], answer: '90', explanation: '0.2×450=90', marks: 4, subsection: 'quantitative' },
        { id: 'apt_q_008', text: 'If price increases by 10% then decreases by 10%, net change is?', options: ['0%','1% decrease','1% increase','0.99% decrease'], answer: '0%','explanation': 'Increase and decrease of same percent do not cancel multiplicatively; here net factor =1.1×0.9=0.99 => 1% decrease', marks: 4, subsection: 'quantitative' },
        { id: 'apt_q_009', text: 'A tank can be filled by pipe A in 5 hrs and pipe B in 10 hrs. How long together?', options: ['3.33 hrs','5 hrs','6.66 hrs','4 hrs'], answer: '3.33 hrs', explanation: 'Rates:1/5+1/10=3/10 => time=10/3=3.33', marks: 4, subsection: 'quantitative' },
        { id: 'apt_q_010', text: 'If x^2 - 5x +6 =0, what are roots?', options: ['2 and 3','-2 and -3','1 and 6','2 and -3'], answer: '2 and 3', explanation: '(x-2)(x-3)=0', marks: 4, subsection: 'quantitative' }
      ]
    },
    qualitative: {
      marks: 30,
      questions: [
        { id: 'apt_qa_001', text: 'Which word is most similar in meaning to EPHEMERAL?', options: ['Permanent','Transient','Significant','Durable'], answer: 'Transient', explanation: 'Ephemeral means lasting a very short time, synonymous with transient.', marks: 3, subsection: 'qualitative' },
        { id: 'apt_qa_002', text: 'Choose the best antonym for LOQUACIOUS', options: ['Talkative','Silent','Garrulous','Verbose'], answer: 'Silent', explanation: 'Loquacious = talkative, antonym = silent', marks: 3, subsection: 'qualitative' },
        { id: 'apt_qa_003', text: 'Read and answer: "All roses are flowers. Some flowers fade quickly. Can we conclude some roses fade quickly?"', options: ['Yes','No','Insufficient info','None'], answer: 'Insufficient info', explanation: 'Some flowers fade quickly may not include roses.', marks: 3, subsection: 'qualitative' },
        { id: 'apt_qa_004', text: 'Select the correct sentence.', options: ['He don\'t know','He doesn\'t know','He doesn\'t knows','He not know'], answer: "He doesn't know", explanation: 'Correct subject-verb agreement', marks: 3, subsection: 'qualitative' },
        { id: 'apt_qa_005', text: 'Choose the word that best fits: The CEO gave a ____ speech praising the team.', options: ['mundane','laudatory','derisive','inconsequential'], answer: 'laudatory', explanation: 'Laudatory = expressing praise', marks: 3, subsection: 'qualitative' },
        { id: 'apt_qa_006', text: 'Which choice best completes the analogy: Tree is to Forest as Star is to ___.', options: ['Galaxy','Sky','Planet','Universe'], answer: 'Galaxy', explanation: 'Many trees make a forest; many stars make a galaxy', marks: 3, subsection: 'qualitative' },
        { id: 'apt_qa_007', text: 'Choose the inference: "If the alarm rings, the guard will check the gate."', options: ['Alarm rings ⇒ guard checks gate','Guard checks gate ⇒ alarm rang','Neither','Both'], answer: 'Alarm rings ⇒ guard checks gate', explanation: 'Direct conditional statement', marks: 3, subsection: 'qualitative' },
        { id: 'apt_qa_008', text: 'Which sentence is punctuated correctly?', options: ['Lets eat, grandma.','Let\'s eat grandma.','Lets eat grandma.','Let\'s eat, grandma.'], answer: "Let's eat, grandma.", explanation: 'Correct use of comma', marks: 3, subsection: 'qualitative' },
        { id: 'apt_qa_009', text: 'Identify the tone: "The results were disappointing, yet instructive."', options: ['angry','optimistic','reflective','sarcastic'], answer: 'reflective', explanation: 'Balanced and thoughtful tone', marks: 3, subsection: 'qualitative' },
        { id: 'apt_qa_010', text: 'Fill in: He is the ____ of the two brothers.', options: ['tallest','taller','more tall','tall'], answer: 'taller', explanation: 'Comparative form', marks: 3, subsection: 'qualitative' }
      ]
    },
    logical: {
      marks: 30,
      questions: [
        { id: 'apt_l_001', text: 'If all Bloops are Razzles, and all Razzles are Lazzles, then which of the following is definitely true?', options: ['All Bloops are Lazzles','All Lazzles are Bloops','All Razzles are Bloops','None of the above'], answer: 'All Bloops are Lazzles', explanation: 'By transitivity: Bloops→Razzles→Lazzles, so all Bloops are Lazzles.', marks: 3, subsection: 'logical' },
        { id: 'apt_l_002', text: 'Sequence: 2,6,18,54,... What is next?', options: ['108','162','216','324'], answer: '162', explanation: 'Multiply by 3 each time', marks: 3, subsection: 'logical' },
        { id: 'apt_l_003', text: 'If in a code, "CAT" is written as "3120" and "DOG" as "4157", find "BAT"', options: ['2120','3120','1120','2121'], answer: '2120', explanation: 'Pattern maps letters to digits as C->3,B->2,A->1,T->0', marks: 3, subsection: 'logical' },
        { id: 'apt_l_004', text: 'Syllogism: Some A are B. All B are C. Can we conclude some A are C?', options: ['Yes','No','Only if...','None'], answer: 'Yes', explanation: 'Some A are B and all B are C => some A are C', marks: 3, subsection: 'logical' },
        { id: 'apt_l_005', text: 'Find the odd one out: 2,3,5,7,11,13,15', options: ['15','13','11','7'], answer: '15', explanation: 'All others are primes', marks: 3, subsection: 'logical' },
        { id: 'apt_l_006', text: 'Blood relation: A is father of B. C is brother of B. How is C related to A?', options: ['Son','Uncle','Nephew','Brother'], answer: 'Son', explanation: 'C is also child of A', marks: 3, subsection: 'logical' },
        { id: 'apt_l_007', text: 'Which completes the series: 1,4,9,16,? ', options: ['20','25','24','30'], answer: '25', explanation: 'Squares of natural numbers', marks: 3, subsection: 'logical' },
        { id: 'apt_l_008', text: 'If A→B and B→C are true, which is false?', options: ['C→A','B→A','Both','None'], answer: 'C→A', explanation: 'Implication not reversible', marks: 3, subsection: 'logical' },
        { id: 'apt_l_009', text: 'Find next: 3,5,11,21,43,...', options: ['85','87','86','90'], answer: '87', explanation: 'Pattern: n->2n+?, sequence adds doubling pattern', marks: 3, subsection: 'logical' },
        { id: 'apt_l_010', text: 'Coding-decoding: If 12345 is coded as 54321, what is code for 678?', options: ['876','678','786','867'], answer: '876', explanation: 'Reverse digits', marks: 3, subsection: 'logical' }
      ]
    }
  },
  system_design: {
    totalMarks: 50,
    questions: [
      { id: 'sd_001', title: 'Design a URL Shortener', prompt: 'Design a URL shortening service like bit.ly. Cover: API design, database schema, hashing strategy, scalability, caching, and analytics tracking. Estimate for 100M URLs/day.', rubricHints: ['Mentions hash function (MD5/Base62)', 'Covers read-heavy architecture', 'Proposes CDN/cache layer', 'Discusses collision handling', 'Estimates storage: ~100M * 500B = 50GB/day', 'Mentions rate limiting'], marks: 10 },
      { id: 'sd_002', title: 'Design Twitter Feed', prompt: 'Design a timeline/feed system for a social network supporting 500M active users. Discuss push vs pull models, denormalization, fanout, and eventual consistency.', rubricHints: ['Discusses push/pull tradeoffs', 'Mentions fanout-on-write vs fanout-on-read', 'Covers caching and CDN', 'Considers write amplification and rate limits', 'Proposes data model for tweets and user timelines'], marks: 10 },
      { id: 'sd_003', title: 'Design Uber', prompt: 'Design a ride-hailing service: matching riders to drivers, dispatch strategy, proximity search, surge pricing, and geo-partitioning.', rubricHints: ['Covers geo-indexing (R-tree/geo-hash)', 'Discusses matching latency', 'Proposes surge pricing approach', 'Considers partitioning and failover'], marks: 10 },
      { id: 'sd_004', title: 'Design WhatsApp Messaging', prompt: 'Design a large-scale messaging system supporting end-to-end encryption, delivery guarantees, and offline message queuing.', rubricHints: ['Mentions E2E encryption and key management', 'Discusses message queueing and persistence', 'Covers delivery receipts and syncing across devices', 'Scalability and presence'], marks: 10 },
      { id: 'sd_005', title: 'Design Netflix Video Streaming', prompt: 'Design a video streaming service: CDN strategy, adaptive bitrate, encoding pipelines, and recommendation system.', rubricHints: ['Mentions CDN and edge caching', 'Discusses ABR logic', 'Considers encoding/transcoding pipelines', 'Mentions personalization and recommendations'], marks: 10 }
    ]
  }
};

export default manifest;
