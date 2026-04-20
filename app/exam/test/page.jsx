"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { fetchChallengeSetByCompany } from "@/lib/challengeSets";
import StarBorder from "../../components/StarBorder";

const C = {
  Meta: { a: "#0668E1", b: "#044DB3", logo: "◉" },
  Amazon: { a: "#FF9900", b: "#CC7A00", logo: "◈" },
  Netflix: { a: "#E50914", b: "#B20710", logo: "▶" },
  Google: { a: "#4285F4", b: "#3367D6", logo: "◎" },
  Apple: { a: "#A2AAAD", b: "#6E6E73", logo: "◆" },
};

const COMPANIES = ["Meta", "Amazon", "Netflix", "Google", "Apple"];

const getLocalQuestions = (company) => {
  const QUESTION_BANK = {
    Meta: {
      coding: [
        { q: "What is the time complexity of finding an element in a balanced Hash Map?", options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"], answer: 2, explanation: "Hash maps provide O(1) average time complexity for lookups." },
        { q: "Which data structure does React's Virtual DOM primarily use for its tree representation?", options: ["Linked List", "Binary Search Tree", "N-ary Tree", "Hash Table"], answer: 2, explanation: "The Virtual DOM is a tree structure where each node represents a UI element." },
        { q: "What is the primary purpose of React.memo()?", options: ["To store state", "To prevent unnecessary re-renders", "To handle API calls", "To create context"], answer: 1, explanation: "React.memo is a higher-order component that memoizes functional components to skip re-renders if props don't change." },
        { q: "In JavaScript, what is the output of 'typeof null'?", options: ["null", "undefined", "object", "string"], answer: 2, explanation: "This is a long-standing bug in JS where null is incorrectly identified as an object." },
        { q: "Which hook would you use to perform a side effect in a functional component?", options: ["useState", "useEffect", "useMemo", "useRef"], answer: 1, explanation: "useEffect is designed for side effects like data fetching or subscriptions." },
        { q: "What is 'Prop Drilling' in React?", options: ["A performance optimization", "Passing props through many levels of components", "A way to fetch data", "Using Redux"], answer: 1, explanation: "Prop drilling is the process of passing data through components that don't need it just to reach a child." },
        { q: "Which of the following is a 'Closure' in JavaScript?", options: ["A function that calls itself", "A function with access to its outer scope", "A private class method", "A syntax error"], answer: 1, explanation: "Closures allow a function to access variables from its parent scope even after the parent has closed." },
        { q: "What is the Big O complexity of a 'Reverse Linked List' algorithm?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], answer: 2, explanation: "Reversing a list requires visiting every node exactly once." },
        { q: "In CSS, what does 'flex-grow: 1' indicate?", options: ["Fixed width", "The item will fill available space", "The item will shrink", "It hides the element"], answer: 1, explanation: "It allows a flex item to grow and occupy remaining space in the container." },
        { q: "What is the purpose of the 'Key' prop in React lists?", options: ["For CSS styling", "To uniquely identify elements for efficient DOM updates", "To handle click events", "To define the component name"], answer: 1, explanation: "Keys help React identify which items have changed, been added, or removed." },
      ],
    },
    Google: {
      coding: [
        { q: "What is the time complexity of Binary Search?", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"], answer: 2, explanation: "Binary search halves the search space at each step, resulting in logarithmic time." },
        { q: "Which algorithm is most efficient for finding the shortest path in a weighted graph?", options: ["BFS", "DFS", "Dijkstra's", "Merge Sort"], answer: 2, explanation: "Dijkstra's algorithm is specifically designed for shortest paths in weighted graphs." },
        { q: "What is the space complexity of a recursive DFS on a skewed tree?", options: ["O(1)", "O(log n)", "O(n)", "O(w)"], answer: 2, explanation: "In a skewed tree (like a linked list), the recursion stack grows linearly with the number of nodes." },
        { q: "What does 'Big O' notation primarily describe?", options: ["Average case speed", "Memory usage only", "Upper bound of growth rate", "Minimum execution time"], answer: 2, explanation: "Big O describes the worst-case growth rate of an algorithm." },
        { q: "What defines an 'Idempotent' API request?", options: ["Always returns 404", "Returns different results every time", "The result is the same regardless of repeated calls", "Requests used only for login"], answer: 2, explanation: "GET, PUT, and DELETE are idempotent; repeating them shouldn't change the server state further." },
        { q: "Which data structure is optimal for 'First-In-First-Out' (FIFO)?", options: ["Stack", "Queue", "Max Heap", "Binary Tree"], answer: 1, explanation: "Queues are FIFO; items are processed in the order they arrive." },
        { q: "What is a 'Race Condition'?", options: ["A fast sorting algorithm", "Multiple threads accessing shared data simultaneously", "A loop that runs forever", "A networking protocol"], answer: 1, explanation: "It occurs when the outcome depends on the unpredictable sequence or timing of thread execution." },
        { q: "What is the main benefit of using a Database Index?", options: ["Saves disk space", "Speeds up data retrieval", "Encrypts data", "Automates backups"], answer: 1, explanation: "Indexes allow the DB to find rows faster without scanning every single record." },
        { q: "What is a 'Deadlock' in operating systems?", options: ["A server crash", "Processes waiting indefinitely for each other's resources", "A deleted record", "A secure password"], answer: 1, explanation: "Deadlock is a state where two or more tasks are blocked forever, each waiting for the other." },
        { q: "What is the primary role of a Load Balancer?", options: ["To bill users", "To distribute traffic across multiple servers", "To minify code", "To store session tokens"], answer: 1, explanation: "Load balancers distribute incoming requests to ensure no single server is overwhelmed." },
      ],
    },
    Netflix: {
      coding: [
        { q: "Which pattern handles microservice failures by failing fast?", options: ["Retry loop", "Circuit Breaker", "Load Balancer", "Sidecar"], answer: 1, explanation: "Circuit Breakers prevent cascading failures by stopping requests to a failing service." },
        { q: "What is 'Horizontal Scaling'?", options: ["Adding RAM to a server", "Adding more server instances", "Optimizing code", "Shifting to cloud"], answer: 1, explanation: "Scaling out (horizontal) means adding more machines to the pool of resources." },
        { q: "What is the role of a Content Delivery Network (CDN)?", options: ["Executing code", "Reducing latency by caching content near users", "Storing user passwords", "Managing databases"], answer: 1, explanation: "CDNs store copies of content at edge locations to speed up delivery." },
        { q: "What is 'Chaos Engineering'?", options: ["Writing code without tests", "Testing system resilience by injecting failures", "Manual server restarts", "Randomized CSS"], answer: 1, explanation: "Chaos engineering involves breaking things on purpose to ensure the system can recover." },
        { q: "What is the 'N+1 Query Problem'?", options: ["A math formula", "Inefficient database access where multiple unnecessary queries are made", "A network timeout", "A security flaw"], answer: 1, explanation: "It happens when one query fetches a parent list and then 'N' separate queries are fired for children." },
        { q: "Which protocol is typically used for real-time video streaming?", options: ["HTTP/1.1", "UDP", "FTP", "SMTP"], answer: 1, explanation: "UDP is faster for streaming as it doesn't wait for retransmissions of lost packets." },
        { q: "What is 'Microservices Architecture'?", options: ["One large application", "A collection of small, independent services", "Using small screens", "Writing code in assembly"], answer: 1, explanation: "Apps are broken into small services that communicate over APIs." },
        { q: "What is the primary function of Docker?", options: ["Image editing", "Containerizing applications for consistency", "Managing social media", "Browser testing"], answer: 1, explanation: "Docker packages an app and its dependencies into a container that runs anywhere." },
        { q: "In the CAP theorem, what does 'P' stand for?", options: ["Performance", "Partition Tolerance", "Persistence", "Privacy"], answer: 1, explanation: "CAP stands for Consistency, Availability, and Partition Tolerance." },
        { q: "What is 'Latency' in a system?", options: ["Number of users", "The delay in processing a request", "The price of bandwidth", "The size of a database"], answer: 1, explanation: "Latency is the time it takes for data to travel from source to destination." },
      ],
    },
    Amazon: {
      coding: [
        { q: "What is the time complexity of Merge Sort?", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], answer: 1, explanation: "Merge sort consistently performs at n log n time regardless of input." },
        { q: "Which AWS service is specifically designed for 'Serverless' compute?", options: ["EC2", "Lambda", "RDS", "EBS"], answer: 1, explanation: "Lambda runs code in response to events without requiring server management." },
        { q: "What is a 'Leaderboard' usually implemented with in Redis for O(log N) operations?", options: ["Hashes", "Sorted Sets", "Strings", "Lists"], answer: 1, explanation: "Sorted Sets (ZSET) are ideal for ranking and scoring systems." },
        { q: "What does the 'S' in SOLID principles stand for?", options: ["Single Responsibility", "Structural Design", "System Security", "Simple Output"], answer: 0, explanation: "The Single Responsibility Principle states a class should have one, and only one, reason to change." },
        { q: "Which structure is used to implement a 'Least Recently Used' (LRU) Cache?", options: ["Stack", "Linked List + Hash Map", "Queue", "Binary Tree"], answer: 1, explanation: "A Doubly Linked List + Hash Map allows O(1) time for both access and updates." },
        { q: "What is 'Sharding'?", options: ["Deleting data", "Horizontal partitioning of a database", "Encryption", "Code minification"], answer: 1, explanation: "Sharding splits a large database into smaller, faster, more manageable chunks." },
        { q: "What is the primary goal of 'Autoscaling'?", options: ["To change colors", "To adjust resources based on demand", "To find bugs", "To encrypt traffic"], answer: 1, explanation: "Autoscaling ensures you have the right amount of compute power available at any time." },
        { q: "What does AWS S3 provide?", options: ["Compute power", "Object storage", "Relational database", "Virtual networking"], answer: 1, explanation: "S3 is a scalable object storage service used for files and data." },
        { q: "Which of these is a NoSQL database?", options: ["MySQL", "PostgreSQL", "DynamoDB", "Oracle"], answer: 2, explanation: "DynamoDB is a fully managed NoSQL database service provided by AWS." },
        { q: "What is a 'Canary Deployment'?", options: ["Deploying to everyone", "Rolling out to a small percentage of users first", "Deploying at night", "Using code from Git"], answer: 1, explanation: "It's a strategy to reduce risk by testing the new version on a subset of users." },
      ],
    },
    Apple: {
      coding: [
        { q: "What memory management system does Swift use?", options: ["Garbage Collection", "Manual", "ARC (Automatic Reference Counting)", "None"], answer: 2, explanation: "ARC handles memory management by keeping track of strong references to instances." },
        { q: "What is '@State' used for in SwiftUI?", options: ["Global state", "Local source of truth for a view", "Network logic", "File storage"], answer: 1, explanation: "@State is a property wrapper for managing data local to a single view." },
        { q: "How do you safely unwrap an optional in Swift?", options: ["if let", "try!", "force-unwrap", "var"], answer: 0, explanation: "'if let' or 'guard let' are the standard safe ways to unwrap optionals." },
        { q: "What are 'Protocols' in Swift?", options: ["Networking only", "A blueprint of methods and properties", "A type of class", "Memory manager"], answer: 1, explanation: "Protocols define a set of requirements that a class, struct, or enum can adopt." },
        { q: "What thread must UI updates be performed on in iOS?", options: ["Background Thread", "Main Thread", "Data Thread", "Any thread"], answer: 1, explanation: "All UI updates must occur on the main thread to ensure stability and performance." },
        { q: "What is a 'Closure' in Swift?", options: ["A self-contained block of functionality", "A way to close an app", "A private variable", "A loop type"], answer: 0, explanation: "Closures are blocks of code that can be passed around and used in your code." },
        { q: "What does LLVM stand for?", options: ["Low Level Virtual Machine", "Large Logic Manager", "Local Live View", "Linker Logic"], answer: 0, explanation: "LLVM is the compiler infrastructure used by Apple for Swift and Objective-C." },
        { q: "What is 'Cocoa Touch'?", options: ["A screen feature", "The UI framework for iOS apps", "A cleaning kit", "A mouse gesture"], answer: 1, explanation: "Cocoa Touch provides the necessary APIs for building touch-based iOS applications." },
        { q: "Which attribute identifies the entry point of a modern SwiftUI app?", options: ["@Main", "@App", "@Entry", "@UIApplicationMain"], answer: 0, explanation: "The @main attribute indicates the starting point of the application execution." },
        { q: "What is the difference between a Struct and a Class in Swift?", options: ["Classes are value types", "Structs are value types", "There is no difference", "Structs use inheritance"], answer: 1, explanation: "In Swift, Structs are value types (copied), whereas Classes are reference types (shared)." },
      ],
    },
  };

  const bank = QUESTION_BANK[company] || QUESTION_BANK["Google"];
  return Object.entries(bank).flatMap(([category, qs]) =>
    qs.map((q, i) => ({
      id: `local-${company}-${category}-${i}`,
      question_text: q.q,
      option_a: q.options[0],
      option_b: q.options[1],
      option_c: q.options[2],
      option_d: q.options[3],
      correct_answer: ["A", "B", "C", "D"][q.answer],
      explanation: q.explanation,
      category,
    }))
  );
};

function ExamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [mounted, setMounted] = useState(false);
  const [company, setCompany] = useState("Google");
  const [isFromJoinNow, setIsFromJoinNow] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const companyParam = searchParams.get("company");
    if (companyParam) {
      setCompany(companyParam);
      setIsFromJoinNow(true);
    }
  }, [searchParams]);

  const resetExam = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setTimeLeft(30);
    setExamStarted(false);
    setExamFinished(false);
    setScore(0);
    setLocked(false);
  };

  useEffect(() => {
    if (mounted) resetExam();
  }, [company, mounted]);

  useEffect(() => {
    if (!mounted) return;

    async function loadQuestions() {
      try {
        setLoading(true);

        if (!supabase) {
          setQuestions(getLocalQuestions(company));
          setLoading(false);
          return;
        }

        const cs = await fetchChallengeSetByCompany(supabase, company);
        if (cs) {
          const { data: qs } = await supabase
            .from("questions")
            .select("id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, category")
            .eq("challenge_set_id", cs.id)
            .limit(10);

          if (qs && qs.length > 0) {
            setQuestions(qs);
            setLoading(false);
            return;
          }
        }
        setQuestions(getLocalQuestions(company));
      } catch (err) {
        setQuestions(getLocalQuestions(company));
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [company, mounted]);

  const handleNextQuestion = useCallback((answer) => {
    const q = questions[currentQ];
    if (!q) return;

    const isCorrect = answer && answer === q.correct_answer;
    const newAnswerObj = { selected: answer, correct: isCorrect };
    
    // Use the latest version of answers to calculate score correctly
    const updatedAnswers = [...answers, newAnswerObj];
    setAnswers(updatedAnswers);
    setSelectedAnswer(null);

    if (currentQ >= questions.length - 1) {
      const finalScore = updatedAnswers.filter((a) => a.correct).length;
      setScore(finalScore);
      setExamFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setCurrentQ((p) => p + 1);
      setTimeLeft(30);
    }
  }, [answers, currentQ, questions]);

  useEffect(() => {
    if (!examStarted || examFinished) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion(null);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examStarted, examFinished, handleNextQuestion]);

  const handleSelectAnswer = (key) => {
    if (selectedAnswer !== null || locked) return;
    setLocked(true);
    setSelectedAnswer(key);
    setTimeout(() => {
      handleNextQuestion(key);
      setLocked(false);
    }, 1500);
  };

  const startExam = () => {
    setExamStarted(true);
    setTimeLeft(30);
  };

  if (!mounted) return <ExamLoading />;
  if (loading) return <ExamLoading />;

  if (!examStarted) {
    return (
      <div className="relative min-h-screen bg-black/30 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 min-h-screen p-4 md:p-6 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 uppercase tracking-tight">
              Interview <span className="text-emerald-500">Arena</span> - {company}
            </h1>
            <p className="text-gray-400 text-sm">Strictly timed. High accuracy required.</p>
          </div>

          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            {!isFromJoinNow && (
              <div className="flex flex-wrap gap-3 justify-center mb-10">
                {COMPANIES.map((c) => (
                  <button 
                    key={c} 
                    onClick={() => setCompany(c)} 
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                      c === company 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg' 
                        : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span>{C[c]?.logo}</span>
                    <span>{c}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-10 text-center">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-2xl font-black text-white">{questions.length}</p>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Questions</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-2xl font-black text-emerald-400">30s</p>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Per Task</p>
              </div>
            </div>

            <div className="flex justify-center">
              <StarBorder
                as="button"
                onClick={startExam}
                className="w-full md:w-auto px-12 py-4 rounded-2xl text-lg font-black text-white bg-emerald-500 hover:bg-emerald-400 transition-all active:scale-95"
              >
                START CHALLENGE →
              </StarBorder>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (examFinished) {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const isGood = percentage >= 70;

    return (
      <div className="relative min-h-screen bg-black/30 flex items-center justify-center p-4">
        <div className="bg-black/40 backdrop-blur-3xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl text-center max-w-md w-full">
          <div className="mb-6 inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400 text-4xl">
            {isGood ? '🏆' : '💪'}
          </div>
          <h1 className="text-3xl font-black text-white mb-8">Debriefing Complete</h1>
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="text-left">
              <p className="text-4xl font-black text-white">{score}/{questions.length}</p>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Correct</p>
            </div>
            <div className="text-left">
              <p className={`text-4xl font-black ${isGood ? 'text-emerald-400' : 'text-amber-400'}`}>{percentage}%</p>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Accuracy</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <button onClick={resetExam} className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all">Retry Sim</button>
            <button onClick={() => router.push("/challenge")} className="w-full py-4 rounded-2xl bg-white/5 text-white border border-white/10 font-bold text-sm uppercase">Exit Arena</button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  if (!q) return null;

  return (
    <div className="relative min-h-screen bg-black/30 p-4 md:p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-black/40 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl" style={{ color: C[company]?.a || "#fff" }}>{C[company]?.logo}</span>
            <span className="text-white font-black tracking-tight uppercase text-sm">{company} Core Test</span>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-black border ${timeLeft <= 10 ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
            {timeLeft}s REMAINING
          </div>
        </div>

        <div className="mb-10">
          <div className="w-full bg-white/5 h-1.5 rounded-full mb-6 overflow-hidden">
             <div 
               className="bg-emerald-500 h-full transition-all duration-500" 
               style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
             />
          </div>
          <p className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest mb-2">Step {currentQ + 1} of {questions.length}</p>
          <h3 className="text-2xl font-bold text-white leading-tight">{q.question_text}</h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {[
            { key: "A", text: q.option_a },
            { key: "B", text: q.option_b },
            { key: "C", text: q.option_c },
            { key: "D", text: q.option_d },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleSelectAnswer(opt.key)}
              disabled={selectedAnswer !== null}
              className={`w-full group flex items-center p-5 rounded-2xl border transition-all text-left ${
                selectedAnswer === opt.key 
                  ? (opt.key === q.correct_answer ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-red-500/20 border-red-500/50')
                  : 'bg-white/[0.03] border-white/10 hover:border-white/30 hover:bg-white/[0.05]'
              }`}
            >
              <span className={`w-8 h-8 flex items-center justify-center rounded-xl mr-4 font-black text-xs transition-colors ${
                selectedAnswer === opt.key ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500 group-hover:bg-white/10'
              }`}>{opt.key}</span>
              <span className="text-gray-200 font-medium text-sm">{opt.text}</span>
            </button>
          ))}
        </div>

        {selectedAnswer && (
          <div className="mt-8 animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1">Contextual Insight</p>
                <p className="text-gray-400 text-xs leading-relaxed">{q.explanation}</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ExamLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505]">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
      <div className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">Calibrating Arena...</div>
    </div>
  );
}

export default function TestExamPage() {
  return (
    <Suspense fallback={<ExamLoading />}>
      <ExamContent />
    </Suspense>
  );
}