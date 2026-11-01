import { DIFFICULTY_CONFIG, type DifficultyLevel } from '../config/difficulty.ts';

export interface ScoreBreakdown {
  base: number;
  cluePoints: number;
  hintPenalty: number;
  final: number;
}

export function computeScore(
  difficulty: DifficultyLevel,
  isAccusationCorrect: boolean,
  uniqueDiscoveredClues: number,
  hintsUsed: number
): ScoreBreakdown {
  const config = DIFFICULTY_CONFIG[difficulty];
  const base = isAccusationCorrect ? config.basePoints : 0;
  const cluePoints = uniqueDiscoveredClues * 5;
  const hintPenalty = hintsUsed * 10;
  const final = Math.max(0, base + cluePoints - hintPenalty);

  return {
    base,
    cluePoints,
    hintPenalty,
    final,
  };
}

export function computePreviewPoints(uniqueDiscoveredClues: number, hintsUsed: number): number {
  const cluePoints = uniqueDiscoveredClues * 5;
  const hintPenalty = hintsUsed * 10;
  return Math.max(0, cluePoints - hintPenalty);
}
