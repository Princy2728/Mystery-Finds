import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { type DifficultyLevel, DIFFICULTY_CONFIG } from '../config/difficulty.ts';
import type { GeneratedMystery } from '../schemas/mysterySchemas.ts';
import { computeScore, type ScoreBreakdown } from '../services/scoringService.ts';
import { ApiError } from '../utils/apiError.ts';

export interface SuspectModel {
  id: string;
  name: string;
  background: string;
  motive: string;
  alibi: string;
}

export interface ClueModel {
  id: string;
  title: string;
  description: string;
  content: string;
  significance: string;
  relatedSuspectIds: string[];
}

export interface HintModel {
  id: string;
  content: string;
}

export interface SolutionModel {
  culpritId: string;
  explanation: string;
  evidenceIds: string[];
  reasoningSummary: string;
}

export interface CaseDocument {
  id: string;
  playerTokenHash: string;
  title: string;
  premise: string;
  story: string;
  difficulty: DifficultyLevel;
  suspects: SuspectModel[];
  clues: ClueModel[];
  hints: HintModel[];
  totalClues: number;
  maxHints: number;
  status: 'active' | 'completed';
  solution: SolutionModel;
  discoveredClueIds: string[];
  hintsUsed: number;
  accusedSuspectId: string | null;
  verdict: 'correct' | 'incorrect' | null;
  score: ScoreBreakdown | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// 24-character hexadecimal ID compatible with MongoDB ObjectId standard
function generateObjectId(): string {
  return crypto.randomBytes(12).toString('hex');
}

export class CaseStore {
  private cases: Map<string, CaseDocument> = new Map();
  private storageFile: string;

  constructor() {
    const dataDir = path.resolve(process.cwd(), '.data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // ignore
      }
    }
    this.storageFile = path.join(dataDir, 'cases.json');
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        const list: CaseDocument[] = JSON.parse(raw);
        for (const item of list) {
          this.cases.set(item.id, item);
        }
      }
    } catch {
      // Fallback to memory
    }
  }

  private saveToDisk() {
    try {
      const list = Array.from(this.cases.values());
      fs.writeFileSync(this.storageFile, JSON.stringify(list, null, 2), 'utf-8');
    } catch {
      // ignore disk write errors in ephemeral environments
    }
  }

  async createCase(
    mystery: GeneratedMystery,
    difficulty: DifficultyLevel,
    playerTokenHash: string
  ): Promise<CaseDocument> {
    const config = DIFFICULTY_CONFIG[difficulty];
    const id = generateObjectId();
    const now = new Date().toISOString();

    const caseDoc: CaseDocument = {
      id,
      playerTokenHash,
      title: mystery.title,
      premise: mystery.premise,
      story: mystery.story,
      difficulty,
      suspects: mystery.suspects,
      clues: mystery.clues,
      hints: mystery.hints,
      totalClues: mystery.clues.length,
      maxHints: config.hints,
      status: 'active',
      solution: mystery.solution,
      discoveredClueIds: [],
      hintsUsed: 0,
      accusedSuspectId: null,
      verdict: null,
      score: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.cases.set(id, caseDoc);
    this.saveToDisk();
    return caseDoc;
  }

  async findById(id: string): Promise<CaseDocument | null> {
    const found = this.cases.get(id);
    if (!found) return null;
    return JSON.parse(JSON.stringify(found));
  }

  async updatePlayerToken(id: string, newHash: string): Promise<void> {
    const doc = this.cases.get(id);
    if (doc) {
      doc.playerTokenHash = newHash;
      this.saveToDisk();
    }
  }

  async discoverClue(
    id: string,
    playerTokenHash: string,
    clueId: string
  ): Promise<{ doc: CaseDocument; clue: ClueModel; alreadyDiscovered: boolean }> {
    const doc = this.cases.get(id);
    if (!doc) {
      throw ApiError.notFound('CASE_NOT_FOUND', `Case with ID '${id}' not found`);
    }

    if (doc.playerTokenHash !== playerTokenHash) {
      if (doc.status === 'active') {
        doc.playerTokenHash = playerTokenHash;
        this.saveToDisk();
      } else {
        throw ApiError.forbidden();
      }
    }

    if (doc.status === 'completed') {
      throw ApiError.conflict('CASE_COMPLETED', 'Case is already completed');
    }

    const clue = doc.clues.find((c) => c.id === clueId);
    if (!clue) {
      throw ApiError.notFound('CLUE_NOT_FOUND', `Clue with ID '${clueId}' not found in this case`);
    }

    const alreadyDiscovered = doc.discoveredClueIds.includes(clueId);
    if (!alreadyDiscovered) {
      doc.discoveredClueIds.push(clueId);
      doc.updatedAt = new Date().toISOString();
      this.saveToDisk();
    }

    return {
      doc: JSON.parse(JSON.stringify(doc)),
      clue,
      alreadyDiscovered,
    };
  }

  async claimHint(
    id: string,
    playerTokenHash: string
  ): Promise<{ doc: CaseDocument; hint: { id: string; index: number; content: string } }> {
    const doc = this.cases.get(id);
    if (!doc) {
      throw ApiError.notFound('CASE_NOT_FOUND', `Case with ID '${id}' not found`);
    }

    if (doc.playerTokenHash !== playerTokenHash) {
      if (doc.status === 'active') {
        doc.playerTokenHash = playerTokenHash;
        this.saveToDisk();
      } else {
        throw ApiError.forbidden();
      }
    }

    if (doc.status === 'completed') {
      throw ApiError.conflict('CASE_COMPLETED', 'Case is already completed');
    }

    if (doc.hintsUsed >= doc.maxHints) {
      throw ApiError.conflict('NO_HINTS_REMAINING', 'No hints remaining for this case');
    }

    const nextIndex = doc.hintsUsed; // 0-indexed
    const hintItem = doc.hints[nextIndex];
    if (!hintItem) {
      throw ApiError.conflict('NO_HINTS_REMAINING', 'No further hints configured');
    }

    doc.hintsUsed += 1;
    doc.updatedAt = new Date().toISOString();
    this.saveToDisk();

    return {
      doc: JSON.parse(JSON.stringify(doc)),
      hint: {
        id: hintItem.id,
        index: doc.hintsUsed,
        content: hintItem.content,
      },
    };
  }

  async accuse(
    id: string,
    playerTokenHash: string,
    suspectId: string
  ): Promise<CaseDocument> {
    const doc = this.cases.get(id);
    if (!doc) {
      throw ApiError.notFound('CASE_NOT_FOUND', `Case with ID '${id}' not found`);
    }

    if (doc.playerTokenHash !== playerTokenHash) {
      if (doc.status === 'active') {
        doc.playerTokenHash = playerTokenHash;
        this.saveToDisk();
      } else {
        throw ApiError.forbidden();
      }
    }

    if (doc.status === 'completed') {
      throw ApiError.conflict('CASE_COMPLETED', 'Case is already completed');
    }

    const suspect = doc.suspects.find((s) => s.id === suspectId);
    if (!suspect) {
      throw ApiError.notFound('SUSPECT_NOT_FOUND', `Suspect with ID '${suspectId}' does not exist`);
    }

    const isCorrect = suspectId === doc.solution.culpritId;
    const finalScore = computeScore(
      doc.difficulty,
      isCorrect,
      doc.discoveredClueIds.length,
      doc.hintsUsed
    );

    const now = new Date().toISOString();
    doc.status = 'completed';
    doc.accusedSuspectId = suspectId;
    doc.verdict = isCorrect ? 'correct' : 'incorrect';
    doc.score = finalScore;
    doc.completedAt = now;
    doc.updatedAt = now;

    this.saveToDisk();
    return JSON.parse(JSON.stringify(doc));
  }
}

export const caseStore = new CaseStore();
