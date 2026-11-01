import { z } from 'zod';
import type { DifficultyLevel } from '../config/difficulty.ts';

export const SuspectSchema = z.object({
  id: z.string().regex(/^suspect_\d+$/, 'Suspect ID must match suspect_N format'),
  name: z.string().min(2).max(100),
  background: z.string().min(10).max(1000),
  motive: z.string().min(10).max(1000),
  alibi: z.string().min(10).max(1000),
});

export const ClueSchema = z.object({
  id: z.string().regex(/^clue_\d+$/, 'Clue ID must match clue_N format'),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(300), // Teaser description
  content: z.string().min(15).max(1000),     // Detailed evidence revealed upon discovery
  significance: z.string().min(10).max(500),// Why it matters, revealed at end
  relatedSuspectIds: z.array(z.string()).min(1),
});

export const HintSchema = z.object({
  id: z.string().regex(/^hint_\d+$/, 'Hint ID must match hint_N format'),
  content: z.string().min(10).max(500),
});

export const SolutionSchema = z.object({
  culpritId: z.string().regex(/^suspect_\d+$/),
  explanation: z.string().min(50).max(2500),
  evidenceIds: z.array(z.string()).min(1),
  reasoningSummary: z.string().min(20).max(1000),
});

export const MysteryGenerationSchema = z.object({
  title: z.string().min(3).max(100),
  premise: z.string(),
  story: z.string().min(150).max(4000),
  suspects: z.array(SuspectSchema),
  clues: z.array(ClueSchema),
  hints: z.array(HintSchema),
  solution: SolutionSchema,
});

export type GeneratedMystery = z.infer<typeof MysteryGenerationSchema>;
export type Suspect = z.infer<typeof SuspectSchema>;
export type Clue = z.infer<typeof ClueSchema>;
export type Hint = z.infer<typeof HintSchema>;
export type Solution = z.infer<typeof SolutionSchema>;

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const;

export const CreateMysteryRequestSchema = z.object({
  premise: z.string().trim().min(10, 'Premise must be at least 10 characters').max(500, 'Premise must be at most 500 characters'),
  difficulty: z.enum(DIFFICULTY_LEVELS),
});

export const AccusationRequestSchema = z.object({
  suspectId: z.string().min(1, 'Suspect ID is required'),
});
