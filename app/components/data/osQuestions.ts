export interface OSQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const osQuestions: OSQuestion[] = [
  {
    id: 1,
    question: "What is an Operating System?",
    options: ["Application software", "System software", "Compiler", "Interpreter"],
    correctIndex: 1,
    explanation: "Operating System is system software that manages hardware and software resources."
  },
  {
    id: 2,
    question: "Which scheduling algorithm gives the shortest job first?",
    options: ["FCFS", "Round Robin", "SJF", "Priority"],
    correctIndex: 2,
    explanation: "SJF (Shortest Job First) scheduling executes shortest job first."
  },
  {
    id: 3,
    question: "What is a deadlock?",
    options: ["Process termination", "Infinite waiting of processes", "Memory overflow", "CPU crash"],
    correctIndex: 1,
    explanation: "Deadlock is a situation where processes are waiting indefinitely for each other."
  },
  {
    id: 4,
    question: "Which of the following is NOT a condition for deadlock?",
    options: ["Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait"],
    correctIndex: 2,
    explanation: "Preemption is actually a solution to avoid deadlock, not a condition."
  },
  {
    id: 5,
    question: "What is virtual memory?",
    options: ["Physical RAM", "Secondary storage used as RAM", "Cache memory", "Register memory"],
    correctIndex: 1,
    explanation: "Virtual memory uses secondary storage to extend main memory capacity."
  },
  {
    id: 6,
    question: "Which of the following is a non-preemptive scheduling algorithm?",
    options: ["Round Robin", "SJF", "Priority (preemptive)", "Multilevel Queue"],
    correctIndex: 1,
    explanation: "SJF is non-preemptive - once started, job runs to completion."
  },
  {
    id: 7,
    question: "What is the main function of CPU scheduling?",
    options: ["Memory allocation", "Disk management", "Process selection", "File storage"],
    correctIndex: 2,
    explanation: "CPU scheduling selects which process gets CPU time slice."
  },
  {
    id: 8,
    question: "What is a process?",
    options: ["Program in execution", "Program in storage", "Instruction set", "Compiler output"],
    correctIndex: 0,
    explanation: "Process is a program in execution with its own address space."
  },
  {
    id: 9,
    question: "Which memory is fastest?",
    options: ["RAM", "ROM", "Cache", "Hard Disk"],
    correctIndex: 2,
    explanation: "Cache memory is the fastest memory type in computer hierarchy."
  },
  {
    id: 10,
    question: "What does paging eliminate?",
    options: ["Deadlock", "Fragmentation", "Scheduling", "Multiprocessing"],
    correctIndex: 1,
    explanation: "Paging eliminates external fragmentation."
  },
  {
    id: 1,
    question: "What is a process in operating systems?",
    options: [
      "A program in execution",
      "A program in memory",
      "A running application",
      "A passive entity"
    ],
    correctIndex: 0,
    explanation: "A process is a program in execution with its own memory space."
  },
  {
    id: 2,
    question: "Which of these are necessary conditions for deadlock?",
    options: [
      "Mutual exclusion and hold & wait",
      "No preemption only",
      "Circular wait only",
      "All of the above"
    ],
    correctIndex: 0,
    explanation: "Deadlock requires 4 conditions: mutual exclusion, hold & wait, no preemption, circular wait."
  },
  {
    id: 3,
    question: "What is virtual memory?",
    options: [
      "Extension of RAM using disk space",
      "RAM that appears larger than physical",
      "Physical memory only",
      "Cache memory"
    ],
    correctIndex: 0,
    explanation: "Virtual memory uses disk as extension of RAM via paging/segmentation."
  },
  {
    id: 4,
    question: "Difference between process and thread?",
    options: [
      "Process has separate address space, thread shares",
      "Threads have separate address space",
      "No difference",
      "Processes share memory"
    ],
    correctIndex: 0,
    explanation: "Processes are isolated, threads share memory within same process."
  },
  {
    id: 5,
    question: "Which scheduling algorithm suffers from starvation?",
    options: [
      "FCFS",
      "Priority scheduling",
      "Round Robin",
      "SJF"
    ],
    correctIndex: 1,
    explanation: "Low priority processes may never run in priority scheduling."
  },
  {
    id: 6,
    question: "Page fault occurs when?",
    options: [
      "Page not in memory",
      "Page in memory but locked",
      "Process terminated",
      "CPU idle"
    ],
    correctIndex: 0,
    explanation: "Page fault = requested page not in physical memory."
  },
  {
    id: 7,
    question: "What is thrashing?",
    options: [
      "High paging activity, low CPU utilization",
      "High CPU usage",
      "Low memory usage",
      "Too many processes"
    ],
    correctIndex: 0,
    explanation: "Thrashing = excessive paging due to insufficient physical memory."
  },
  {
    id: 8,
    question: "Banker's algorithm is used for?",
    options: [
      "Deadlock avoidance",
      "Deadlock detection",
      "Memory allocation",
      "CPU scheduling"
    ],
    correctIndex: 0,
    explanation: "Banker's checks safe state before resource allocation."
  },
  {
    id: 9,
    question: "Which is not a semaphore operation?",
    options: [
      "P() and V()",
      "wait() and signal()",
      "test_and_set()",
      "acquire() and release()"
    ],
    correctIndex: 2,
    explanation: "test_and_set is hardware instruction for mutual exclusion."
  },
  {
    id: 10,
    question: "Context switch time is pure overhead because?",
    options: [
      "No useful work done",
      "CPU usage high",
      "Memory accessed",
      "I/O performed"
    ],
    correctIndex: 0,
    explanation: "Context switch = OS overhead, no user code executes."
  },
  {
    id: 11,
    question: "Belady's anomaly occurs in which paging algorithm?",
    options: [
      "FIFO",
      "LRU",
      "Optimal",
      "Random"
    ],
    correctIndex: 0,
    explanation: "FIFO may have more faults with more frames."
  },
  {
    id: 12,
    question: "What does FCFS stand for?",
    options: [
      "First Come First Served",
      "Fastest CPU First Served",
      "Fair Come First Served",
      "First CPU First Served"
    ],
    correctIndex: 0,
    explanation: "Simplest scheduling - processes served in arrival order."
  },
  // Add 10+ more for endless mode
  {
    id: 13,
    question: "What is semaphore?",
    options: [
      "Synchronization primitive",
      "Memory allocator",
      "CPU scheduler",
      "Process creator"
    ],
    correctIndex: 0,
    explanation: "Semaphore = variable used for process synchronization."
  },
  {
    id: 14,
    question: "Critical section problem solved by?",
    options: [
      "Mutual exclusion",
      "All of these",
      "Progress",
      "Bounded waiting"
    ],
    correctIndex: 1,
    explanation: "All four required for proper critical section solution."
  }
];

export function getRandomQuestions(count: number): OSQuestion[] {
  const shuffled = [...osQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

