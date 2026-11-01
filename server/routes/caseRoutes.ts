import { Router } from 'express';
import {
  createCase,
  getCase,
  discoverClue,
  claimHint,
  accuse,
  getResult,
  getHealth,
} from '../controllers/caseController.ts';

export const router = Router();

router.get('/health', getHealth);
router.post('/cases', createCase);
router.get('/cases/:id', getCase);
router.post('/cases/:id/clues/:clueId/discover', discoverClue);
router.post('/cases/:id/hints', claimHint);
router.post('/cases/:id/accuse', accuse);
router.get('/cases/:id/result', getResult);
