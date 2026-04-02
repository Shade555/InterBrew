// Helper scoring utilities for Phase 1 challenge

export type CodingProblemResult = {
  id: string;
  title: string;
  score: number; // 0-100
  breakdown?: { correctness?: number; complexity?: number; edgeCases?: number };
  testsPassed?: number;
  testsTotal?: number;
};

export type AptitudeSubsection = {
  score: number; // raw subsection score (e.g., out of 40/30/30 depending)
  maxScore: number;
};

export type SystemDesignQuestion = {
  id: string;
  title: string;
  score: number;
  rubric?: Record<string, number>;
};

export function computeCodingSectionScore(problems: CodingProblemResult[]): number {
  if (!problems || problems.length === 0) return 0;
  const total = problems.reduce((s, p) => s + (typeof p.score === 'number' ? p.score : 0), 0);
  return total / problems.length;
}

export function computeAptitudeSectionScore(subsections: Record<string, AptitudeSubsection>): number {
  // expected keys: quantitative (40), qualitative (30), logical (30)
  const quantitative = subsections.quantitative || { score: 0, maxScore: 40 };
  const qualitative = subsections.qualitative || { score: 0, maxScore: 30 };
  const logical = subsections.logical || { score: 0, maxScore: 30 };

  // Normalize each to its weight and sum to 100
  const qNorm = (quantitative.score / quantitative.maxScore) * 40;
  const qualNorm = (qualitative.score / qualitative.maxScore) * 30;
  const lNorm = (logical.score / logical.maxScore) * 30;

  const total = qNorm + qualNorm + lNorm;
  return Math.max(0, Math.min(100, Number(total.toFixed(4))));
}

export function computeSystemDesignSectionScore(questions: SystemDesignQuestion[]): number {
  if (!questions || questions.length === 0) return 0;
  const total = questions.reduce((s, q) => s + (typeof q.score === 'number' ? q.score : 0), 0);
  return total / questions.length;
}

export function computeFinalScore(
  codingScore: number,
  aptitudeScore: number,
  designScore: number,
  weights: { coding: number; aptitude: number; system_design: number }
): number {
  const finalRaw = (codingScore * weights.coding) + (aptitudeScore * weights.aptitude) + (designScore * weights.system_design);
  return Number((finalRaw).toFixed(3));
}
