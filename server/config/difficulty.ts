export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  suspects: number;
  clues: number;
  hints: number;
  basePoints: number;
  minEvidenceIds: number;
  description: string;
}

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    suspects: 3,
    clues: 5,
    hints: 2,
    basePoints: 100,
    minEvidenceIds: 3,
    description: '3 Suspects · 5 Clues · 2 Hints · Base 100 pts. Direct motives, straightforward evidence trail.',
  },
  medium: {
    suspects: 4,
    clues: 7,
    hints: 3,
    basePoints: 150,
    minEvidenceIds: 4,
    description: '4 Suspects · 7 Clues · 3 Hints · Base 150 pts. Deceptive alibis, red herrings, intertwining timelines.',
  },
  hard: {
    suspects: 5,
    clues: 9,
    hints: 3,
    basePoints: 200,
    minEvidenceIds: 5,
    description: '5 Suspects · 9 Clues · 3 Hints · Base 200 pts. Deep conspiracy, conflicting testimonies, subtle forensic detail.',
  },
};
