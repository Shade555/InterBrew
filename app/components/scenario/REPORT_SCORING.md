# Scenario Lesson — Report & Score Generation

## Overview

When a user completes a scenario module lesson, the system generates a performance report by combining two components: a **quiz score** and an **interview score**. The final score drives the XP reward and the overall rating badge shown in the feedback screen.

---

## 1. Final Score

```
finalScore = (quizPercent × 0.5) + (interviewScore × 0.5)
```

Range: **0 – 100**

---

## 2. Quiz Score (`quizPercent`)

```
quizPercent = round((correctCount / totalQuiz) × 100)
```

- `correctCount` — number of quiz questions answered correctly
- `totalQuiz` — total quiz questions in the lesson (up to 5, randomly selected)
- Range: 0 – 100%

---

## 3. Interview Score

```
interviewScore = round((softSkillPercent × interviewCompletionRate) / 100)
```

### 3a. Interview Completion Rate

```
interviewCompletionRate = min(100, (userResponses.length / totalQuestionsAsked) × 100)
```

- `userResponses` — all messages the user sent during the interview
- `totalQuestionsAsked` — number of AI messages (each AI turn = one question)

### 3b. Soft Skill Percent

```
softSkillPercent = (avgSoftSkill / 5) × 100
avgSoftSkill = (clarityScore + listeningScore + confidenceScore) / 3
```

All three soft skill scores are on a **1 – 5** scale, but are capped by a **participation penalty**:

```
participationLevel = min(100, avgResponseLength × 5)
maxSoftSkillScore  = participationLevel < 20 ? 1
                   : participationLevel < 50 ? 2
                   : 3
```

Where `avgResponseLength` = average word count across all user responses.

---

## 4. Soft Skill Scores (1 – 5)

### Clarity Score
Based on average response length (words):

| avgResponseLength | Score |
|---|---|
| ≥ 25 | 5 |
| ≥ 18 | 4 |
| ≥ 12 | 3 |
| ≥ 6  | 2 |
| < 6  | 1 |

### Listening Score
Based on interruption count (user speaking while AI is talking):

| Interruptions | Score |
|---|---|
| 0 | 5 |
| 1 | 4 |
| 2 | 3 |
| 3 | 2 |
| ≥ 4 | 1 |

### Confidence Score
Based on hesitations, pauses, and response length:

| Condition | Score |
|---|---|
| hesitations = 0 AND pauses ≤ 1 AND avgLength ≥ 15 | 5 |
| hesitations ≤ 2 AND pauses ≤ 3 AND avgLength ≥ 10 | 4 |
| hesitations ≤ 4 AND pauses ≤ 5 | 3 |
| hesitations ≤ 7 | 2 |
| otherwise | 1 |

**Hesitation detection** — filler words matched via regex:
```
/\b(um+|uh+|er+|hmm+|erm+|ah+|like|you know|basically|literally|so so|i mean)\b/gi
```

All three scores are capped at `maxSoftSkillScore` (participation penalty).

---

## 5. Overall Rating

An interrupt penalty is applied to the quiz score for rating purposes only (does not affect `finalScore`):

```
adjustedQuiz = max(0, quizPercent - (interrupts × 10))
```

| Condition | Rating | Colour |
|---|---|---|
| adjustedQuiz ≥ 80 AND avgResponseLength ≥ 15 | Excellent | emerald |
| adjustedQuiz ≥ 60 AND avgResponseLength ≥ 10 | Good | blue |
| adjustedQuiz ≥ 40 | Satisfactory | amber |
| otherwise | Needs Improvement | rose |

---

## 6. Strengths & Improvements

### Strengths (awarded when condition is met)

| Condition | Strength |
|---|---|
| interrupts = 0 | "Stayed focused and let the interviewer finish speaking" |
| hesitationCount = 0 AND avgLength ≥ 5 | "Spoke fluently with no noticeable filler words" |
| quizPercent ≥ 80 | "Strong grasp of theoretical concepts" |
| avgResponseLength ≥ 20 | "Detailed and thoughtful interview responses" |
| userResponses.length ≥ totalQuestionsAsked | "Completed all interview questions" |
| correctCount = totalQuiz | "Perfect quiz score!" |
| no other strengths | "Completed the full module flow" (fallback) |

### Improvements (awarded when condition is met)

| Condition | Improvement |
|---|---|
| interrupts > 0 | "Interrupted the interviewer X time(s) — practice active listening" |
| userResponses = 0 AND interrupts = 0 | "Participate in the interview by responding to questions instead of ending early" |
| userResponses = 0 AND interrupts > 0 | "You ended the interview early without providing answers — complete the full interview next time" |
| hesitationCount ≤ 3 AND avgLength ≥ 5 | "X filler word(s) detected — try to pause instead of using fillers" |
| hesitationCount > 3 | "X filler words detected — slow down and breathe before answering" |
| avgLength > 0 AND avgLength < 5 | "You barely spoke during the interview — try to provide fuller answers" |
| quizPercent ≥ 50 AND < 80 | "Review quiz topics to strengthen theoretical knowledge" |
| quizPercent < 50 | "Revisit the explanation and video materials for better concept clarity" |
| avgLength ≥ 10 AND < 20 | "Try to elaborate more in your interview answers" |
| avgLength < 10 | "Provide more detailed responses during the interview" |
| userResponses > 0 AND < totalQuestionsAsked | "Engage more fully in the interview — try answering more questions" |
| userResponses = 0 | "Participate in the interview by answering the questions asked" |
| no other improvements | "Continue practicing to maintain your skills" (fallback) |

---

## 7. XP Reward

```
xpReward = 50 + finalScore
```

| finalScore | XP |
|---|---|
| 100 | 150 |
| 75  | 125 |
| 50  | 100 |
| 0   | 50  |

- **Minimum**: 50 XP (guaranteed for completing the lesson)
- **Maximum**: 150 XP (perfect score)

### Daily XP Update Logic

1. Fetch `profiles.xp`, `profiles.daily_xp`, `profiles.daily_xp_reset_date`
2. If `daily_xp_reset_date ≠ today (YYYY-MM-DD)` → reset `daily_xp` to 0
3. `newDailyXP = currentDailyXP + xpReward`
4. Write back:
   - `profiles.xp` += xpReward (cumulative total)
   - `profiles.daily_xp` = newDailyXP (resets each day)
   - `profiles.daily_xp_reset_date` = today

---

## 8. Report Object Shape

```js
{
  quizScore: {
    correct: number,       // correct answers
    total: number,         // total questions
    percent: number        // 0–100
  },
  finalScore: number,      // 0–100
  interviewStats: {
    questionsAnswered: number,
    totalQuestions: number,
    avgWords: number       // avg words per response
  },
  behavioralStats: {
    interruptions: number,
    hesitations: number,   // filler word count
    pauses: number
  },
  softSkills: [
    { label: "Communicated ideas clearly",      score: 1–5 },
    { label: "Listened actively to others",     score: 1–5 },
    { label: "Expressed thoughts confidently",  score: 1–5 }
  ],
  strengths: string[],
  improvements: string[],
  overallRating: "Excellent" | "Good" | "Satisfactory" | "Needs Improvement",
  ratingColor: "emerald" | "blue" | "amber" | "rose"
}
```

---

## 9. Database Writes on Completion

### `user_ai_reports`
```js
{
  user_id,
  module_id,
  score: finalScore,
  daily_xp: 50 + finalScore,
  recommendation: "Report generated successfully"
}
```

### `user_module_progress`
```js
{
  user_id,
  module_id,
  completed: true,
  completed_at: ISO timestamp
}
```
Upsert on conflict `(user_id, module_id)`.

### `user_dashboards` (weekly XP chart)
Today's `chartPoints` entry is updated to `newDailyXP`. If the stored points are from a previous week, a fresh Mon–Sun skeleton is built first.

---

## 10. Edge Cases

| Scenario | Behaviour |
|---|---|
| User never responds | All soft skills capped at 1; interviewScore = 0 |
| User exits interview early | Completion rate < 100%; soft skills penalised |
| User interrupts AI | Each interrupt deducts 10 pts from adjustedQuiz (rating only) |
| New calendar day | `daily_xp` resets to 0 before adding new XP |
| New week | `user_dashboards.chartPoints` skeleton rebuilt from Monday |
| Debug complete (100%) | Skips interview; directly upserts `user_module_progress` with no XP write |
