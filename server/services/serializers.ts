import type { CaseDocument } from '../models/caseStore.ts';
import { computePreviewPoints } from './scoringService.ts';

export interface PublicClue {
  id: string;
  title: string;
  description: string;
  discovered: boolean;
  content?: string;
  relatedSuspectIds?: string[];
}

export interface PublicHint {
  id: string;
  index: number;
  content: string;
}

export interface CaseProgress {
  cluesDiscovered: number;
  totalClues: number;
  hintsUsed: number;
  hintsRemaining: number;
  maxHints: number;
  currentPoints: number;
}

export interface PublicCase {
  id: string;
  title: string;
  premise: string;
  story: string;
  difficulty: string;
  status: 'active' | 'completed';
  suspects: Array<{
    id: string;
    name: string;
    background: string;
    motive: string;
    alibi: string;
  }>;
  clues: PublicClue[];
  hints: PublicHint[];
  progress: CaseProgress;
  createdAt: string;
}

export interface ResultEvidence {
  id: string;
  title: string;
  content: string;
  significance: string;
}

export interface CaseResult {
  caseId: string;
  title: string;
  verdict: 'correct' | 'incorrect';
  accusedSuspect: {
    id: string;
    name: string;
  };
  culprit: {
    id: string;
    name: string;
  };
  explanation: string;
  reasoningSummary: string;
  evidence: ResultEvidence[];
  score: {
    base: number;
    cluePoints: number;
    hintPenalty: number;
    final: number;
  };
  cluesDiscovered: number;
  hintsUsed: number;
  completedAt: string;
}

export function toProgress(doc: CaseDocument): CaseProgress {
  const cluesDiscovered = doc.discoveredClueIds.length;
  const hintsUsed = doc.hintsUsed;
  const hintsRemaining = Math.max(0, doc.maxHints - hintsUsed);
  const currentPoints = computePreviewPoints(cluesDiscovered, hintsUsed);

  return {
    cluesDiscovered,
    totalClues: doc.totalClues,
    hintsUsed,
    hintsRemaining,
    maxHints: doc.maxHints,
    currentPoints,
  };
}

export function toPublicCase(doc: CaseDocument): PublicCase {
  const discoveredSet = new Set(doc.discoveredClueIds);

  const clues: PublicClue[] = doc.clues.map((c) => {
    const isDiscovered = discoveredSet.has(c.id);
    if (isDiscovered) {
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        discovered: true,
        content: c.content,
        relatedSuspectIds: c.relatedSuspectIds,
      };
    }
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      discovered: false,
    };
  });

  const hints: PublicHint[] = doc.hints.slice(0, doc.hintsUsed).map((h, idx) => ({
    id: h.id,
    index: idx + 1,
    content: h.content,
  }));

  return {
    id: doc.id,
    title: doc.title,
    premise: doc.premise,
    story: doc.story,
    difficulty: doc.difficulty,
    status: doc.status,
    suspects: doc.suspects.map((s) => ({
      id: s.id,
      name: s.name,
      background: s.background,
      motive: s.motive,
      alibi: s.alibi,
    })),
    clues,
    hints,
    progress: toProgress(doc),
    createdAt: doc.createdAt,
  };
}

export function toResult(doc: CaseDocument): CaseResult {
  if (doc.status !== 'completed' || !doc.accusedSuspectId || !doc.verdict || !doc.score) {
    throw new Error('Case is not completed yet');
  }

  const accused = doc.suspects.find((s) => s.id === doc.accusedSuspectId);
  const culprit = doc.suspects.find((s) => s.id === doc.solution.culpritId);

  // Evidence clues
  const evidenceClues: ResultEvidence[] = doc.solution.evidenceIds
    .map((evId) => doc.clues.find((c) => c.id === evId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => ({
      id: c.id,
      title: c.title,
      content: c.content,
      significance: c.significance,
    }));

  return {
    caseId: doc.id,
    title: doc.title,
    verdict: doc.verdict,
    accusedSuspect: {
      id: accused?.id || doc.accusedSuspectId,
      name: accused?.name || 'Unknown Suspect',
    },
    culprit: {
      id: culprit?.id || doc.solution.culpritId,
      name: culprit?.name || 'Unknown Culprit',
    },
    explanation: doc.solution.explanation,
    reasoningSummary: doc.solution.reasoningSummary,
    evidence: evidenceClues,
    score: doc.score,
    cluesDiscovered: doc.discoveredClueIds.length,
    hintsUsed: doc.hintsUsed,
    completedAt: doc.completedAt || new Date().toISOString(),
  };
}
