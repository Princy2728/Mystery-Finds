import type { Request, Response, NextFunction } from 'express';
import { CreateMysteryRequestSchema, AccusationRequestSchema } from '../schemas/mysterySchemas.ts';
import { generateMysteryWithGemini } from '../services/geminiService.ts';
import { caseStore } from '../models/caseStore.ts';
import { toPublicCase, toResult, toProgress } from '../services/serializers.ts';
import { ApiError } from '../utils/apiError.ts';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

function validateCaseId(id: string): void {
  if (!id || !OBJECT_ID_REGEX.test(id)) {
    throw ApiError.invalidId('Invalid case ID format. Must be a 24-character hex string.');
  }
}

export async function createCase(req: Request, res: Response, next: NextFunction) {
  try {
    const parseResult = CreateMysteryRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      const msg = parseResult.error.issues[0]?.message || 'Please provide a valid mystery premise.';
      throw ApiError.badRequest(msg);
    }

    const { premise, difficulty } = parseResult.data;
    const playerTokenHash = req.playerTokenHash;

    if (!playerTokenHash) {
      throw ApiError.unauthorized('Player session token could not be established');
    }

    // Call Gemini with validation and retries
    const mystery = await generateMysteryWithGemini(premise, difficulty);

    // Save case in persistent store
    const caseDoc = await caseStore.createCase(mystery, difficulty, playerTokenHash);

    return res.status(201).json({
      success: true,
      data: {
        case: toPublicCase(caseDoc),
        sessionToken: req.sessionToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCase(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    validateCaseId(id);

    const doc = await caseStore.findById(id);
    if (!doc) {
      throw ApiError.notFound('CASE_NOT_FOUND', `Case with ID '${id}' not found`);
    }

    if (doc.playerTokenHash !== req.playerTokenHash) {
      if (doc.status === 'active' && req.playerTokenHash) {
        await caseStore.updatePlayerToken(id, req.playerTokenHash);
        doc.playerTokenHash = req.playerTokenHash;
      } else {
        throw ApiError.forbidden();
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        case: toPublicCase(doc),
        sessionToken: req.sessionToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function discoverClue(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, clueId } = req.params;
    validateCaseId(id);

    if (!clueId || !/^clue_\d+$/.test(clueId)) {
      throw ApiError.badRequest('Invalid clue ID format');
    }

    if (!req.playerTokenHash) {
      throw ApiError.unauthorized();
    }

    const result = await caseStore.discoverClue(id, req.playerTokenHash, clueId);

    return res.status(200).json({
      success: true,
      data: {
        clue: {
          id: result.clue.id,
          title: result.clue.title,
          content: result.clue.content,
        },
        alreadyDiscovered: result.alreadyDiscovered,
        progress: toProgress(result.doc),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function claimHint(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    validateCaseId(id);

    if (!req.playerTokenHash) {
      throw ApiError.unauthorized();
    }

    const result = await caseStore.claimHint(id, req.playerTokenHash);

    return res.status(200).json({
      success: true,
      data: {
        hint: result.hint,
        progress: toProgress(result.doc),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function accuse(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    validateCaseId(id);

    const parseResult = AccusationRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw ApiError.badRequest('Suspect ID is required to make an accusation');
    }

    const { suspectId } = parseResult.data;

    if (!req.playerTokenHash) {
      throw ApiError.unauthorized();
    }

    const updatedDoc = await caseStore.accuse(id, req.playerTokenHash, suspectId);

    return res.status(200).json({
      success: true,
      data: {
        result: toResult(updatedDoc),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getResult(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    validateCaseId(id);

    const doc = await caseStore.findById(id);
    if (!doc) {
      throw ApiError.notFound('CASE_NOT_FOUND', `Case with ID '${id}' not found`);
    }

    if (doc.playerTokenHash !== req.playerTokenHash) {
      throw ApiError.forbidden();
    }

    if (doc.status !== 'completed') {
      throw ApiError.conflict('CASE_NOT_COMPLETED', 'Case has not been solved or accused yet');
    }

    return res.status(200).json({
      success: true,
      data: {
        result: toResult(doc),
      },
    });
  } catch (err) {
    next(err);
  }
}

export function getHealth(_req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      db: 'connected',
    },
  });
}
