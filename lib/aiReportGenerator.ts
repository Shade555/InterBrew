interface AIReportGeneratorInputs {
  lesson_score: number;
  scenario_score: number;
  interview_score: number;
  xp_score: number;
  readiness_score: number;
  readiness_level: string;
  previous_score: number;
  lessons_completed?: number;
  total_lessons?: number;
  scenarios_completed?: number;
  total_scenarios?: number;
  interviews_completed?: number;
  total_interviews?: number;
  xp?: number;
  max_xp?: number;
}

interface AIReportGeneratorOutput {
  trend: "improving" | "declining" | "stable";
  strongest_area: string;
  weakest_area: string;
  report_text: string;
}

const getTrend = (
  current_score: number,
  previous_score: number,
): "improving" | "declining" | "stable" => {
  const delta = current_score - previous_score;
  if (delta > 5) return "improving";
  if (delta < -5) return "declining";
  return "stable";
};

const getArea = (
  scores: { [key: string]: number },
  type: "strongest" | "weakest",
): string => {
  const entries = Object.entries(scores);
  if (entries.length === 0) return "N/A";

  const sorted = entries.sort((a, b) =>
    type === "strongest" ? b[1] - a[1] : a[1] - b[1],
  );
  return sorted[0][0];
};

const getStatusMessage = (score: number): string => {
  if (score < 40) return "You are in the early stages of your preparation.";
  if (score >= 40 && score < 60)
    return "You are making solid progress but are not quite interview-ready yet.";
  if (score >= 60 && score < 80)
    return "You are getting close to being interview-ready. Keep up the great work!";
  return "You are well-prepared for your interviews. Continue to refine your skills.";
};

export const generateAIReport = (
  inputs: AIReportGeneratorInputs,
): AIReportGeneratorOutput => {
  const {
    lesson_score,
    scenario_score,
    interview_score,
    xp_score,
    readiness_score,
    readiness_level,
    previous_score,
    lessons_completed = 0,
    total_lessons = 1,
    scenarios_completed = 0,
    total_scenarios = 1,
    interviews_completed = 0,
    total_interviews = 1,
    xp = 0,
    max_xp = 1,
  } = inputs;

  // Ensure all scores are valid numbers, defaulting to 0 if not.
  const ls = lesson_score || 0;
  const ss = scenario_score || 0;
  const is = interview_score || 0;
  const xs = xp_score || 0;

  const trend = getTrend(readiness_score, previous_score);

  const scores = {
    Lessons: ls,
    Scenarios: ss,
    Interviews: is,
    XP: xs,
  };

  const strongest_area = getArea(scores, "strongest");
  const weakest_area = getArea(scores, "weakest");
  const status_message = getStatusMessage(readiness_score);

  const report_text = `Your readiness score is ${readiness_score}/100 (${readiness_level}). Your trend is ${trend}. ${status_message} Focus on improving ${weakest_area.toLowerCase()}.`;

  return {
    trend,
    strongest_area,
    weakest_area,
    report_text,
  };
};
