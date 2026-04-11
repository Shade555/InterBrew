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

// Fallback local questions if Supabase is empty
const getLocalQuestions = (company) => {
  const QUESTION_BANK = {
    Meta: {
      coding: [
        { q: "What is the time complexity of finding an element in a hash map?", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], answer: 2, explanation: "Hash maps provide O(1) average lookup." },
        { q: "Which data structure does React's Virtual DOM resemble?", options: ["Stack", "Queue", "Tree", "Graph"], answer: 2, explanation: "The Virtual DOM is structured as a tree." },
        { q: "In-order traversal of BST produces?", options: ["Random", "Descending", "Ascending", "Level order"], answer: 2, explanation: "In-order traversal gives sorted ascending order." },
        { q: "What is the output of typeof null in JavaScript?", options: ["null", "undefined", "object", "string"], answer: 2, explanation: "typeof null returns 'object' - this is a known JS bug." },
        { q: "Which React hook is used for side effects?", options: ["useState", "useEffect", "useContext", "useReducer"], answer: 1, explanation: "useEffect is used for side effects." },
        { q: "What is the time complexity of accessing an element in an array by index?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], answer: 0, explanation: "Array access by index is O(1)." },
        { q: "Which sorting algorithm has O(n²) worst-case complexity?", options: ["Merge Sort", "Quick Sort", "Bubble Sort", "Heap Sort"], answer: 2, explanation: "Bubble Sort has O(n²) worst-case." },
        { q: "What does REST stand for?", options: ["Remote Execution State Transfer", "Representational State Transfer", "Resource State Transaction", "Remote Endpoint Service Transfer"], answer: 1, explanation: "REST = Representational State Transfer." },
        { q: "Which HTTP method is idempotent?", options: ["POST", "PUT", "PATCH", "DELETE"], answer: 1, explanation: "PUT is idempotent - multiple calls same result." },
        { q: "What is the purpose of a closure in JavaScript?", options: ["To close browser windows", "To access outer scope variables", "To delete objects", "To create arrays"], answer: 1, explanation: "Closures access outer scope variables." },
      ],
    },
    Google: {
      coding: [
        { q: "Time complexity of binary search?", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"], answer: 2, explanation: "Binary search halves the search space." },
        { q: "What does memoization mean?", options: ["Storing results to avoid recomputation", "Deleting old cache", "Sorting data", "Parallel processing"], answer: 0, explanation: "Memoization caches results." },
        { q: "Trie is best used for?", options: ["Sorting numbers", "Prefix-based search", "Graph traversal", "Heap operations"], answer: 1, explanation: "Tries are optimized for prefix searching." },
        { q: "What is the space complexity of recursive DFS?", options: ["O(1)", "O(V)", "O(V+E)", "O(E)"], answer: 1, explanation: "DFS uses O(V) space for recursion stack." },
        { q: "Which data structure uses LIFO?", options: ["Queue", "Stack", "Array", "Linked List"], answer: 1, explanation: "Stack uses Last In First Out." },
        { q: "What is the time complexity of Dijkstra's algorithm?", options: ["O(V)", "O(E)", "O(V log V)", "O(V²)"], answer: 2, explanation: "With min-heap, Dijkstra is O((V+E) log V)." },
        { q: "Which algorithm finds shortest path in weighted graph?", options: ["BFS", "DFS", "Dijkstra's", "Binary Search"], answer: 2, explanation: "Dijkstra finds shortest path in weighted graphs." },
        { q: "What is a hash collision?", options: ["Two keys same hash", "Password reset", "Server error", "Network timeout"], answer: 0, explanation: "Hash collision is when two keys produce same hash." },
        { q: "What is the purpose of Big O notation?", options: ["Memory measurement", "Time complexity analysis", "Code formatting", "Network speed"], answer: 1, explanation: "Big O describes algorithm efficiency." },
        { q: "Which tree is self-balancing?", options: ["Binary Tree", "BST", "AVL Tree", "Decision Tree"], answer: 2, explanation: "AVL tree is self-balancing." },
      ],
    },
    Netflix: {
      coding: [
        { q: "Which pattern handles microservice failures gracefully?", options: ["Retry loop", "Circuit Breaker", "Load Balancer", "Caching"], answer: 1, explanation: "Circuit Breaker stops cascading failures." },
        { q: "What does REST stand for?", options: ["Remote Execution State Transfer", "Representational State Transfer", "Resource State Transaction", "Remote Endpoint Service Transfer"], answer: 1, explanation: "REST = Representational State Transfer." },
        { q: "Which HTTP method is idempotent?", options: ["POST", "PUT", "PATCH", "None"], answer: 1, explanation: "PUT is idempotent." },
        { q: "What is eventual consistency?", options: ["Immediate consistency", "Guaranteed consistency", "Async consistency model", "No consistency"], answer: 2, explanation: "Eventual consistency allows temporary inconsistency." },
        { q: "Which protocol is used for service communication?", options: ["HTTP", "gRPC", "FTP", "SMTP"], answer: 1, explanation: "gRPC is used for high-performance service communication." },
        { q: "What is a microservice?", options: ["Large application", "Small independently deployable service", "Database", "UI framework"], answer: 1, explanation: "Microservices are small, independently deployable services." },
        { q: "What is containerization?", options: ["Physical containers", "Lightweight virtualization", "Data storage", "Network protocol"], answer: 1, explanation: "Containerization packages apps with their dependencies." },
        { q: "What is the purpose of a CDN?", options: ["Database storage", "Content delivery", "Code compilation", "User authentication"], answer: 1, explanation: "CDN delivers content from edge locations." },
        { q: "What is API Gateway?", options: ["Database tool", "Single entry point for microservices", "UI framework", "Testing tool"], answer: 1, explanation: "API Gateway is the single entry point for backend services." },
        { q: "What is horizontal scaling?", options: ["Adding more power to machine", "Adding more machines", "Reducing resources", "Database scaling"], answer: 1, explanation: "Horizontal scaling adds more machines to handle load." },
      ],
    },
    Amazon: {
      coding: [
        { q: "Time complexity of merge sort?", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], answer: 1, explanation: "Merge sort is O(n log n)." },
        { q: "What triggers a Lambda 'cold start'?", options: ["Every call", "First call or after inactivity", "Memory overflow", "Timeout"], answer: 1, explanation: "Cold starts happen on first call or after inactivity." },
        { q: "Best data structure for a priority queue?", options: ["Array", "Linked List", "Heap", "Stack"], answer: 2, explanation: "Heap provides O(log n) insert." },
        { q: "What is SQS in AWS?", options: ["Simple Queue Service", "SQL Query Service", "Storage Service", "Security Service"], answer: 0, explanation: "SQS is Simple Queue Service." },
        { q: "Which AWS service is serverless?", options: ["EC2", "Lambda", "RDS", "EBS"], answer: 1, explanation: "Lambda is AWS serverless compute." },
        { q: "What are AWS Lambda layers?", options: ["Network layers", "Shared code/libs", "Database layers", "Security layers"], answer: 1, explanation: "Lambda layers contain shared libraries." },
        { q: "What is DynamoDB?", options: ["Relational DB", "Document database", "Graph DB", "Time series DB"], answer: 1, explanation: "DynamoDB is AWS NoSQL document database." },
        { q: "What is the CAP theorem?", options: ["Programming language", "Consistency/Availability/Partition tolerance", "Network protocol", "Security standard"], answer: 1, explanation: "CAP theorem describes tradeoffs in distributed systems." },
        { q: "What is sharding in databases?", options: ["Data backup", "Horizontal partitioning", "Index creation", "Query optimization"], answer: 1, explanation: "Sharding horizontally partitions data across databases." },
        { q: "What are AWS Leadership Principles?", options: ["Management rules", "Customer obsession & innovation", "HR policies", "Security rules"], answer: 1, explanation: "Leadership Principles guide Amazon's culture." },
      ],
    },
    Apple: {
      coding: [
        { q: "Swift uses which memory management system?", options: ["Manual", "Garbage collection", "ARC (Automatic Reference Counting)", "Reference counting only"], answer: 2, explanation: "Swift uses ARC." },
        { q: "What is a closure in Swift?", options: ["A loop construct", "A self-contained block capturing context", "A class method", "A type alias"], answer: 1, explanation: "Closures capture surrounding context." },
        { q: "UIKit's MVC stands for?", options: ["Model-View-Controller", "Model-View-Component", "Module-View-Container", "Memory-View-Cache"], answer: 0, explanation: "MVC separates data, UI, logic." },
        { q: "What is @State in SwiftUI?", options: ["Database connection", "Local view state", "Network request", "File system"], answer: 1, explanation: "@State manages local view state." },
        { q: "What is a Swift Protocol?", options: ["Network protocol", "Blueprint of methods", "Database", "UI component"], answer: 1, explanation: "Protocols define method blueprints." },
        { q: "What is Core Data primarily used for?", options: ["Network requests", "Local data persistence", "UI rendering", "Authentication"], answer: 1, explanation: "Core Data is for local persistence." },
        { q: "What is the purpose of @escaping in Swift?", options: ["Makes it faster", "Allows closure to outlive the function", "Prevents capturing", "Makes it optional"], answer: 1, explanation: "@escaping allows storage." },
        { q: "What is SwiftUI?", options: ["Database", "UI framework", "Network library", "Testing framework"], answer: 1, explanation: "SwiftUI is Apple's modern UI framework." },
        { q: "What is Combine in Swift?", options: ["Database", "Reactive framework", "UI toolkit", "Testing tool"], answer: 1, explanation: "Combine is Apple's reactive framework." },
        { q: "What is Xcode?", options: ["Database", "IDE for Apple development", "Version control", "Cloud service"], answer: 1, explanation: "Xcode is Apple's IDE." },
      ],
    },
  };

  const bank = QUESTION_BANK[company];
  if (!bank) return [];

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
  const initialCompany = searchParams.get("company") || "Google";
  
  // Check if company was passed via URL (from Join Now button)
  const isFromJoinNow = searchParams.get("company") !== null;

  const [company, setCompany] = useState(initialCompany);
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
    resetExam();
  }, [company]);

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);

        // Check if Supabase is available
        if (!supabase) {
          console.log("Supabase not configured, using local questions");
          const localQs = getLocalQuestions(company);
          setQuestions(localQs);
          setLoading(false);
          return;
        }

        // Try to fetch from Supabase first
        const cs = await fetchChallengeSetByCompany(supabase, company);

        if (cs) {
          // Fetch questions from Supabase
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

        // Fallback to local questions if Supabase is empty
        const localQs = getLocalQuestions(company);
        setQuestions(localQs);
      } catch (err) {
        console.error("Error loading questions:", err);
        // Fallback to local on error
        const localQs = getLocalQuestions(company);
        setQuestions(localQs);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [company]);

  const handleNextQuestion = useCallback((answer) => {
    const q = questions[currentQ];
    if (!q) return;

    const isCorrect = answer && answer === q.correct_answer;

    const newAnswers = [...answers, { selected: answer, correct: isCorrect }];
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQ >= questions.length - 1) {
      const correct = newAnswers.filter((a) => a.correct).length;
      setScore(correct);
      setExamFinished(true);
      clearInterval(timerRef.current);
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

    return () => clearInterval(timerRef.current);
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

  const q = questions?.[currentQ];

  if (loading) {
    return (
      <div className="relative min-h-screen bg-black/30 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-emerald-400 text-xl font-semibold">Loading Exam...</div>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="relative min-h-screen bg-black/30 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 min-h-screen p-4 md:p-6 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Live Interview - {company}
            </h1>
            <p className="text-gray-400 text-sm">Test your skills with timed challenges</p>
          </div>

          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
            {!isFromJoinNow && (
              <div className="flex flex-wrap gap-3 justify-center mb-8">
                {COMPANIES.map((c) => (
                  <button 
                    key={c} 
                    onClick={() => setCompany(c)} 
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      c === company 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
                        : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span>{C[c].logo}</span>
                    <span>{c}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="text-center mb-8">
              <p className="text-2xl font-bold text-white mb-2">{questions.length} Questions</p>
              <p className="text-gray-400 text-sm mb-4">30 seconds per question</p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">⏱ 30s per Q</span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">📝 Multiple Choice</span>
                <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">💡 Instant Feedback</span>
              </div>
            </div>

            <div className="flex justify-center">
              <StarBorder
                as="button"
                type="button"
                color="#3f9371"
                speed="5s"
                onClick={startExam}
                className="flex justify-center items-center py-3 px-8 rounded-full text-lg font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
              >
                Start Interview →
              </StarBorder>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (examFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const isGood = percentage >= 70;

    return (
      <div className="relative min-h-screen bg-black/30 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 min-h-screen p-4 md:p-6 max-w-4xl mx-auto">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Interview Complete! 🎉
            </h1>

            <div className="flex justify-center items-center gap-8 mb-6">
              <div className="text-center">
                <p className="text-6xl font-bold text-white mb-2">{score}/{questions.length}</p>
                <p className="text-gray-400 text-sm">Correct Answers</p>
              </div>
              <div className="w-px h-20 bg-white/10"></div>
              <div className="text-center">
                <p className={`text-6xl font-bold mb-2 ${isGood ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {percentage}%
                </p>
                <p className="text-gray-400 text-sm">Accuracy</p>
              </div>
            </div>

            <p className={`text-lg font-semibold mb-8 ${isGood ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isGood ? ' Excellent performance!' : ' Keep practicing to improve!'}
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <button 
                onClick={resetExam} 
                className="px-6 py-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold hover:bg-blue-500/30 transition-all"
              >
                Try Again
              </button>

              <button 
                onClick={() => router.push("/challenge")} 
                className="px-6 py-3 rounded-xl bg-white/5 text-white border border-white/10 font-semibold hover:bg-white/10 transition-all"
              >
                Back to Challenges
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const options = [
    { key: "A", text: q.option_a },
    { key: "B", text: q.option_b },
    { key: "C", text: q.option_c },
    { key: "D", text: q.option_d },
  ];

  const progress = (currentQ / questions.length) * 100;

  return (
    <div className="relative min-h-screen bg-black/30 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen p-4 md:p-6 max-w-3xl mx-auto">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl" style={{ color: C[company].a }}>{C[company].logo}</span>
              <span className="text-white font-bold">{company}</span>
            </div>
            <div className={`px-4 py-2 rounded-xl text-lg font-bold ${timeLeft <= 10 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              ⏱ {timeLeft}s
            </div>
          </div>

          <div className="mb-6">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>Question {currentQ + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white leading-relaxed">
              {currentQ + 1}. {q.question_text}
            </h3>
          </div>

          <div className="space-y-3 mb-6">
            {options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleSelectAnswer(opt.key)}
                disabled={selectedAnswer !== null}
                className={`w-full flex items-center p-4 rounded-xl border transition-all text-left ${
                  selectedAnswer === opt.key 
                    ? (opt.key === q.correct_answer 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-white' 
                        : 'bg-red-500/20 border-red-500/50 text-white')
                    : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:border-white/20'
                } ${selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold mr-4 ${
                  selectedAnswer === opt.key
                    ? (opt.key === q.correct_answer ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white')
                    : 'bg-white/10 text-gray-300'
                }`}>
                  {opt.key}
                </span>
                <span className="flex-1">{opt.text}</span>
              </button>
            ))}
          </div>

          {selectedAnswer && q.explanation && (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-blue-400 font-semibold mb-1">💡 Explanation</p>
              <p className="text-gray-300 text-sm">{q.explanation}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function ExamLoading() {
  return (
    <div className="relative min-h-screen bg-black/30 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-emerald-400 text-xl font-semibold">Loading Exam...</div>
      </div>
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

