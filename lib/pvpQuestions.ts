import { osQuestions } from '@/data/osQuestions';

export async function getQuestionsForSubject(subject: string, count = 10) {
  let questions = [];

  switch (subject.toLowerCase()) {
    case 'os':
      questions = osQuestions.slice(0, count).map(q => ({
        q: q.question,
        options: q.options,
        answer: q.correctIndex,
        explanation: q.explanation || ''
      }));
      break;
    default:
      // Fallback to OS or add more mappings
      questions = osQuestions.slice(0, count).map(q => ({
        q: q.question,
        options: q.options,
        answer: q.correctIndex,
        explanation: q.explanation || ''
      }));
  }

  // Shuffle for fairness
  return questions.sort(() => Math.random() - 0.5);
}

