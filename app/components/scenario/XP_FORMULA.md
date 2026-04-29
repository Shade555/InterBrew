# XP Reward Formula

## Overview
Users earn XP points upon completing scenario lessons with performance-based rewards.

## Formula
```
Total XP = 50 + Performance Score
```

Where:
- **Base XP**: 50 points (guaranteed for completion)
- **Performance Score**: User's final score on the lesson (0-100)

## Examples

| Performance | Calculation | Total XP |
|------------|------------|----------|
| 100% | 50 + 100 | **150 XP** |
| 90% | 50 + 90 | **140 XP** |
| 80% | 50 + 80 | **130 XP** |
| 75% | 50 + 75 | **125 XP** |
| 50% | 50 + 50 | **100 XP** |
| 25% | 50 + 25 | **75 XP** |
| 0% | 50 + 0 | **50 XP** |

## Range
- **Minimum XP**: 50 (for completing a lesson)
- **Maximum XP**: 150 (for perfect 100% performance)

## Implementation
- Applied in: `app/components/scenario/lesson.jsx` (line 165)
- XP Display: `app/components/profile/PersonalInfo.jsx` (green Zap icon)
- Celebration Animation: `app/components/scenario/XPRewardAnimation.tsx` (green particles + emerald glow)
- Database: Stored in `profiles.xp` column

## Related Files
- `lesson.jsx` - XP calculation on lesson completion
- `XPRewardAnimation.tsx` - Animated celebration with XP amount display
- `PersonalInfo.jsx` - Profile XP stat display
