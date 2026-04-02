export type CompanyName = "Meta" | "Amazon" | "Netflix" | "Google" | "Apple";
export type CategoryKey = "coding" | "aptitude" | "system";

export const COMPANIES: CompanyName[] = ["Meta", "Amazon", "Netflix", "Google", "Apple"];

export const COMPANY_CONFIG: Record<CompanyName, { a: string; b: string; logo: string }> = {
  Meta:    { a: "#10b981", b: "#059669", logo: "◉" },
  Amazon:  { a: "#10b981", b: "#059669", logo: "◈" },
  Netflix: { a: "#ef4444", b: "#dc2626", logo: "▶" },
  Google:  { a: "#10b981", b: "#059669", logo: "◎" },
  Apple:   { a: "#10b981", b: "#059669", logo: "◆" },
};

export const CATEGORY_META: Record<CategoryKey, { icon: string; label: string; desc: string }> = {
  coding: { icon: "💻", label: "Coding & DSA", desc: "Algorithms, data structures, complexity" },
  aptitude: { icon: "🧠", label: "Aptitude", desc: "Quantitative reasoning, series, logic" },
  system: { icon: "🏗", label: "System Design", desc: "Architecture, DBs, scalability" },
};

export const QUESTION_BANK: Record<CompanyName, Record<CategoryKey, { q: string; options: string[]; answer: number; explanation: string }[]>> = {
  Meta: {
    coding: [
      {q: "What is the time complexity of finding an element in a hash map?", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], answer: 2, explanation: "Hash maps offer O(1) average-case lookup."},
      {q: "Which data structure does React's virtual DOM primarily resemble?", options: ["Stack", "Queue", "Tree", "Graph"], answer: 2, explanation: "React's Virtual DOM is a tree structure."},
      {q: "In a binary search tree, in-order traversal gives elements in which order?", options: ["Random", "Descending", "Ascending", "Level order"], answer: 2, explanation: "In-order traversal gives sorted ascending order."},
      {q: "Space complexity of recursive DFS on a graph with V vertices?", options: ["O(1)", "O(V)", "O(V²)", "O(E)"], answer: 1, explanation: "DFS uses a call stack proportional to depth."},
      {q: "Which algorithm finds shortest path in an unweighted graph?", options: ["Dijkstra's", "BFS", "DFS", "Bellman-Ford"], answer: 1, explanation: "BFS finds shortest path in unweighted graphs."},
    ],
    aptitude: [
      {q: "Meta's DAU grows from 2B to 2.6B. What is the % increase?", options: ["25%", "30%", "26%", "20%"], answer: 1, explanation: "(0.6/2) × 100 = 30% increase."},
      {q: "A server handles 10,000 req/sec. How many in 2.5 minutes?", options: ["1,500,000", "1,200,000", "1,800,000", "2,000,000"], answer: 0, explanation: "10,000 × 150 = 1,500,000 requests."},
      {q: "A does a task in 4h, B in 6h. Together they finish in?", options: ["2.4 hours", "3 hours", "2 hours", "5 hours"], answer: 0, explanation: "Combined rate = 1/4 + 1/6 = 5/12. Time = 12/5 = 2.4 hours."},
      {q: "What is 15% of 2400?", options: ["360", "320", "380", "340"], answer: 0, explanation: "15/100 × 2400 = 360."},
    ],
    system: [
      {q: "What consistency model does Cassandra primarily use?", options: ["Strong consistency", "Eventual consistency", "Linearizability", "Serializability"], answer: 1, explanation: "Cassandra uses eventual consistency."},
      {q: "Which pattern does Facebook News Feed use for celebrity fanout?", options: ["Push only", "Pull only", "Hybrid push-pull", "Event sourcing"], answer: 2, explanation: "Facebook uses hybrid approach."},
      {q: "What does CDN stand for in system design?", options: ["Content Delivery Network", "Central Data Node", "Core Distribution Network", "Content Data Nexus"], answer: 0, explanation: "CDN caches content geographically."},
      {q: "Meta stores billions of photos. Best storage type?", options: ["Relational DB", "Object Storage", "In-memory cache", "Graph DB"], answer: 1, explanation: "Object storage is ideal for photos."},
    ],
  },
  Amazon: {
    coding: [
      {q: "Time complexity of merge sort?", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], answer: 1, explanation: "Merge sort is O(n log n)."},
      {q: "What does FIFO stand for in Amazon SQS?", options: ["First In First Out", "Fast Input Fast Output", "File In File Out", "First Index First Output"], answer: 0, explanation: "FIFO ensures order."},
      {q: "Best sorting algorithm for nearly sorted data?", options: ["Quick Sort", "Merge Sort", "Insertion Sort", "Heap Sort"], answer: 2, explanation: "Insertion sort is O(n) on nearly sorted."},
      {q: "What triggers a Lambda 'cold start'?", options: ["Every call", "First call or after inactivity", "Memory overflow", "Timeout"], answer: 1, explanation: "Cold starts happen on first call or after inactivity."},
      {q: "Best data structure for a priority queue?", options: ["Array", "Linked List", "Heap", "Stack"], answer: 2, explanation: "Heap provides O(log n) insert."},
    ],
    aptitude: [
      {q: "Amazon's revenue grows 20% from $500B. New revenue?", options: ["$550B", "$580B", "$600B", "$620B"], answer: 2, explanation: "500 × 1.20 = $600B."},
      {q: "240 boxes/hr with 5 workers. 1 worker in 30 mins?", options: ["24", "48", "12", "20"], answer: 0, explanation: "240/5 = 48/hr. In 30 mins = 24."},
      {q: "Train travels 360km at 90 km/h. How long?", options: ["3h", "4h", "3.5h", "5h"], answer: 1, explanation: "360/90 = 4 hours."},
      {q: "Next: 3, 6, 12, 24, ?", options: ["36", "48", "42", "30"], answer: 1, explanation: "Each doubles: 24 × 2 = 48."},
    ],
    system: [
      {q: "Amazon DynamoDB is best described as?", options: ["Relational DB", "Document & key-value NoSQL", "Graph DB", "Time-series DB"], answer: 1, explanation: "DynamoDB is a NoSQL database."},
      {q: "AWS service for microservice decoupling via messages?", options: ["EC2", "S3", "SQS", "RDS"], answer: 2, explanation: "SQS decouples microservices."},
      {q: "What is the CAP theorem?", options: ["Cache, API, Performance", "Consistency, Availability, Partition tolerance", "Concurrency, Atomicity, Persistence", "Cost, Access, Processing"], answer: 1, explanation: "CAP: 2 of C, A, P."},
      {q: "What powers Redis sorted sets?", options: ["Arrays", "B-Trees", "Skip List + Hash Table", "Tries"], answer: 2, explanation: "Redis sorted sets use skip list + hash."},
    ],
  },
  Netflix: {
    coding: [
      {q: "Which pattern handles microservice failures gracefully?", options: ["Retry loop", "Circuit Breaker", "Load Balancer", "Caching"], answer: 1, explanation: "Circuit Breaker stops cascading failures."},
      {q: "Output of [1,2,3].reduce((acc,val)=>acc+val,0)?", options: ["6", "0", "123", "Error"], answer: 0, explanation: "reduce accumulates: 0+1+2+3=6."},
      {q: "Which HTTP method is idempotent?", options: ["POST", "PUT", "PATCH", "None"], answer: 1, explanation: "PUT is idempotent."},
      {q: "A/B testing at scale requires which concept?", options: ["Monolithic arch", "Feature flags", "Sync APIs only", "Single DB"], answer: 1, explanation: "Feature flags enable experiments."},
      {q: "What does REST stand for?", options: ["Remote Execution State Transfer", "Representational State Transfer", "Resource State Transaction", "Remote Endpoint Service Transfer"], answer: 1, explanation: "REST = Representational State Transfer."},
    ],
    aptitude: [
      {q: "260M subscribers. 15% upgrade at $5 more/month. Extra revenue?", options: ["$195M", "$180M", "$210M", "$175M"], answer: 0, explanation: "260M × 0.15 × 5 = $195M."},
      {q: "Content costs rise 12% from $17B. New cost?", options: ["$18.04B", "$19.04B", "$19.5B", "$17.5B"], answer: 1, explanation: "17 × 1.12 = $19.04B."},
      {q: "Next: 1, 4, 9, 16, 25, ?", options: ["30", "36", "49", "32"], answer: 1, explanation: "Perfect squares: 6² = 36."},
      {q: "4 servers handle 800 req/sec. Servers for 2000 req/sec?", options: ["8", "10", "12", "6"], answer: 1, explanation: "2000/200 = 10 servers."},
    ],
    system: [
      {q: "Netflix's Chaos Monkey is used for?", options: ["Performance testing", "Killing services to test resilience", "Load balancing", "DB sharding"], answer: 1, explanation: "Chaos Monkey tests fault tolerance."},
      {q: "Netflix uses which protocol for adaptive bitrate streaming?", options: ["RTMP", "AVI", "MPEG-DASH and HLS", "FLV"], answer: 2, explanation: "Netflix uses MPEG-DASH and HLS."},
      {q: "Netflix Open Connect is?", options: ["An API gateway", "A custom CDN in ISPs", "A load balancer", "A container orchestrator"], answer: 1, explanation: "Open Connect is Netflix's CDN."},
      {q: "Best DB for video recommendations at scale?", options: ["Pure SQL", "Graph database", "Time-series DB", "Flat files"], answer: 1, explanation: "Graph DBs model relationships efficiently."},
    ],
  },
  Google: {
    coding: [
      {q: "Time complexity of binary search?", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"], answer: 2, explanation: "Binary search halves the search space."},
      {q: "What does 'memoization' mean in dynamic programming?", options: ["Storing results to avoid recomputation", "Deleting old cache", "Sorting data", "Parallel processing"], answer: 0, explanation: "Memoization caches results."},
      {q: "A trie is most efficient for?", options: ["Sorting numbers", "Prefix-based string search", "Graph traversal", "Heap operations"], answer: 1, explanation: "Tries excel at prefix searches."},
      {q: "PageRank assigns higher rank to pages with?", options: ["More images", "More inbound links from high-ranked pages", "Faster load", "More text"], answer: 1, explanation: "PageRank is iterative."},
      {q: "MapReduce processes data in which two phases?", options: ["Read & Write", "Map & Reduce", "Filter & Sort", "Split & Merge"], answer: 1, explanation: "MapReduce: Map and Reduce phases."},
    ],
    aptitude: [
      {q: "Google processes 8.5B searches/day. Per second (approx)?", options: ["~85,000", "~98,000", "~75,000", "~100,000"], answer: 1, explanation: "8.5B / 86,400 ≈ 98,380."},
      {q: "Ad revenue $224B grows 10%. New revenue?", options: ["$246.4B", "$234B", "$244B", "$250B"], answer: 0, explanation: "224 × 1.10 = $246.4B."},
      {q: "Odd one out: 2, 3, 5, 7, 9, 11", options: ["2", "9", "11", "5"], answer: 1, explanation: "9 is not prime."},
      {q: "Password: 8 chars, A-Z only. Combinations?", options: ["26⁸", "8²⁶", "26×8", "8!"], answer: 0, explanation: "Each position: 26 choices."},
    ],
    system: [
      {q: "Google Bigtable is what type of database?", options: ["Relational", "Wide-column NoSQL", "Document store", "Key-value only"], answer: 1, explanation: "Bigtable is wide-column NoSQL."},
      {q: "What does Google Spanner guarantee uniquely?", options: ["High availability only", "Global strong consistency", "Low cost", "Simple queries"], answer: 1, explanation: "Spanner provides global consistency."},
      {q: "Caching eviction strategy for Google Search?", options: ["Write-through only", "LRU (Least Recently Used)", "FIFO", "Random"], answer: 1, explanation: "LRU is ideal for web caches."},
      {q: "GKE is built on?", options: ["Docker Swarm", "Kubernetes", "Apache Mesos", "Nomad"], answer: 1, explanation: "GKE is built on Kubernetes."},
    ],
  },
  Apple: {
    coding: [
      {q: "Swift uses which memory management system?", options: ["Manual", "Garbage collection", "ARC (Automatic Reference Counting)", "Reference counting only"], answer: 2, explanation: "Swift uses ARC."},
      {q: "What is a closure in Swift?", options: ["A loop construct", "A self-contained block capturing context", "A class method", "A type alias"], answer: 1, explanation: "Closures capture surrounding context."},
      {q: "Core Data in iOS is primarily used for?", options: ["Network requests", "Local data persistence", "UI rendering", "Authentication"], answer: 1, explanation: "Core Data is for local persistence."},
      {q: "Purpose of @escaping in Swift closures?", options: ["Makes it faster", "Allows closure to outlive the function", "Prevents capturing", "Makes it optional"], answer: 1, explanation: "@escaping allows storage."},
      {q: "UIKit's MVC stands for?", options: ["Model-View-Controller", "Model-View-Component", "Module-View-Container", "Memory-View-Cache"], answer: 0, explanation: "MVC separates data, UI, logic."},
    ],
    aptitude: [
      {q: "Market cap ~$3T drops 5%. New value?", options: ["$2.85T", "$2.90T", "$2.80T", "$2.75T"], answer: 0, explanation: "3 × 0.95 = $2.85T."},
      {q: "240M iPhones at avg $900. Total revenue?", options: ["$216B", "$240B", "$196B", "$180B"], answer: 0, explanation: "240M × 900 = $216B."},
      {q: "3 engineers build feature in 10 days. Days for 5 engineers?", options: ["6 days", "5 days", "4 days", "8 days"], answer: 0, explanation: "30 man-days / 5 = 6 days."},
      {q: "Sum is 100, difference is 20. Ratio of larger to smaller?", options: ["3:2", "2:3", "4:1", "6:4"], answer: 0, explanation: "x=60, y=40 → ratio 3:2."},
    ],
    system: [
      {q: "What makes Apple's Secure Enclave unique?", options: ["Software encryption", "Hardware-isolated coprocessor", "TPM module", "Network isolation"], answer: 1, explanation: "Secure Enclave is hardware-isolated."},
      {q: "Apple Pay tokenization replaces card numbers with?", options: ["QR codes", "Device Account Numbers", "Biometric hashes", "CVV codes"], answer: 1, explanation: "Tokenization generates device numbers."},
      {q: "Push notifications to millions of iPhones uses?", options: ["SMS gateway", "APNS", "Email relay", "WebSockets only"], answer: 1, explanation: "APNS maintains persistent connections."},
      {q: "iCloud file sync consistency approach?", options: ["Peer-to-peer only", "Centralized cloud with conflict resolution", "Blockchain", "FTP"], answer: 1, explanation: "iCloud uses centralized servers."},
    ],
  },
};

export const UPCOMING_INTERVIEWS = [
  {company: "Google" as CompanyName, role: "SWE L4", date: "2026-03-08", time: "10:00 AM", type: "Technical", interviewer: "Alex Chen"},
  {company: "Meta" as CompanyName, role: "SWE E4", date: "2026-03-12", time: "2:00 PM", type: "System Design", interviewer: "Sarah Kim"},
  {company: "Amazon" as CompanyName, role: "SDE II", date: "2026-03-18", time: "11:00 AM", type: "Behavioral + Coding", interviewer: "James Liu"},
  {company: "Apple" as CompanyName, role: "iOS Engineer", date: "2026-03-22", time: "3:30 PM", type: "Technical", interviewer: "Priya Sharma"},
];

export const LIVE_SESSIONS = [
  {company: "Netflix" as CompanyName, host: "Tech Prep Pro", time: "Today 5:00 PM", participants: 47, topic: "System Design Deep Dive", role: "Senior Engineer", live: true},
  {company: "Google" as CompanyName, host: "FAANG Coach", time: "Tomorrow 7:00 PM", participants: 83, topic: "Algorithms & Data Structures", role: "SWE L5", live: false},
  {company: "Meta" as CompanyName, host: "InterviewGuru", time: "Mar 6, 6:00 PM", participants: 62, topic: "Distributed Systems", role: "E5 Engineer", live: false},
  {company: "Amazon" as CompanyName, host: "CloudPro", time: "Mar 7, 8:00 PM", participants: 35, topic: "Leadership Principles + LLD", role: "SDE III", live: false},
];

export const CHECKLISTS = [
  {title: "Day Before", icon: "🌙", items: ["Review company news & products", "Practice 2-3 coding problems", "Prepare STAR method stories", "Set up camera & mic test", "Get 8 hours sleep"]},
  {title: "Day Of Interview", icon: "☀️", items: ["Eat a good breakfast", "Review notes 1 hour before", "Join 5 minutes early", "Have water & paper ready", "Breathe and stay confident!"]},
  {title: "Technical Prep", icon: "💻", items: ["Arrays, Trees, Graphs, DP", "System Design fundamentals", "Company's tech stack", "Time & space complexity", "Practice on whiteboard"]},
  {title: "Behavioral Prep", icon: "🗣", items: ["Why this company?", "Biggest challenge solved", "Leadership & conflict examples", "Questions to ask interviewer", "Review your past projects"]},
];


