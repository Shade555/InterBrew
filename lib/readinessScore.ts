/**
 * Calculates a normalized score from 0-100 for a given metric.
 * Handles division by zero safely.
 *
 * @param completed - The number of items completed.
 * @param total - The total number of items.
 * @returns A score between 0 and 100.
 */
const normalizeMetric = (completed: number, total: number): number => {
  if (total === 0) {
    return 0;
  }
  return (completed / total) * 100;
};

/**
 * Determines the readiness level based on a given score.
 *
 * @param score - The readiness score (0-100).
 * @returns The corresponding readiness level as a string.
 */
const getReadinessLevel = (score: number): string => {
  if (score < 40) return "Beginner";
  if (score >= 40 && score < 60) return "Progressing";
  if (score >= 60 && score < 80) return "Interview Ready";
  return "Strong Candidate";
};

interface ReadinessInputs {
  lessons_completed: number;
  total_lessons: number;
  scenarios_completed: number;
  total_scenarios: number;

  interviews_completed: number;
  total_interviews: number;
  xp: number;
  max_xp: number;
}

interface ReadinessOutput {
  lesson_score: number;
  scenario_score: number;
  interview_score: number;
  xp_score: number;
  readiness_score: number;
  readiness_level: string;
}

/**
 * Calculates an overall readiness score based on multiple performance metrics.
 *
 * @param inputs - An object containing all the metrics required for the calculation.
 * @returns An object with the normalized scores, final readiness score, and readiness level.
 */
export const calculateReadinessScore = (
  inputs: ReadinessInputs,
): ReadinessOutput => {
  const {
    lessons_completed,
    total_lessons,
    scenarios_completed,
    total_scenarios,
    interviews_completed,
    total_interviews,
    xp,
    max_xp,
  } = inputs;

  // 1. Normalize each metric
  const lesson_score = normalizeMetric(lessons_completed, total_lessons);
  const scenario_score = normalizeMetric(scenarios_completed, total_scenarios);
  const interview_score = normalizeMetric(
    interviews_completed,
    total_interviews,
  );
  const xp_score = Math.min(100, normalizeMetric(xp, max_xp));

  // 2. Compute final readiness_score using weights
  const readiness_score =
    lesson_score * 0.25 +
    scenario_score * 0.25 +
    interview_score * 0.35 +
    xp_score * 0.15;

  // 3. Assign readiness_level
  const readiness_level = getReadinessLevel(readiness_score);

  // 4. Return the final object
  return {
    lesson_score,
    scenario_score,
    interview_score,
    xp_score,
    readiness_score: Math.round(readiness_score), // Return a rounded score
    readiness_level,
  };
};
