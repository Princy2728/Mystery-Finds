import assert from 'node:assert/strict';
import { computeScore, computePreviewPoints } from '../server/services/scoringService.ts';
import { DIFFICULTY_CONFIG } from '../server/config/difficulty.ts';
import { validateMysteryConsistency } from '../server/services/validationService.ts';
import { toPublicCase, toResult } from '../server/services/serializers.ts';
import { CaseStore } from '../server/models/caseStore.ts';
import { GeneratedMystery } from '../server/schemas/mysterySchemas.ts';

function createSampleMystery(): GeneratedMystery {
  return {
    title: 'The Case of the Missing Ruby',
    premise: 'A priceless Burmese ruby vanishes from the estate library during midnight tea.',
    story: 'On a stormy autumn evening at Ashcroft Manor, the private library safe was forced open while guests were gathered in the drawing room. The famed crimson ruby was stolen and replaced with a piece of worthless tinted red glass, sparking immediate suspicion among those present.',
    suspects: [
      {
        id: 'suspect_1',
        name: 'Arthur Pendelton',
        background: 'The family butler with 30 years of loyal service.',
        motive: 'Secret gambling debts to local bookmakers.',
        alibi: 'Claims he was polishing silverware in the pantry.',
      },
      {
        id: 'suspect_2',
        name: 'Lady Eleanor',
        background: 'The estranged niece facing bankruptcy.',
        motive: 'Disinherited from the estate will.',
        alibi: 'Claims she was reading in the conservatory.',
      },
      {
        id: 'suspect_3',
        name: 'Dr. Charles Vance',
        background: 'The family physician who had late night access.',
        motive: 'Funding an illicit medical research clinic.',
        alibi: 'Administering nighttime sedatives to the host.',
      },
    ],
    clues: [
      {
        id: 'clue_1',
        title: 'Velvet Ribbon',
        description: 'A frayed purple ribbon snagged on the safe hinge.',
        content: 'Fibers matched the dress worn by Lady Eleanor earlier that night.',
        significance: 'Proves Eleanor was at the safe during the storm.',
        relatedSuspectIds: ['suspect_2'],
      },
      {
        id: 'clue_2',
        title: 'Silver Polish Cloth',
        description: 'A damp cloth left on the pantry table.',
        content: 'Shows traces of fresh silver cleaner, verifying Arthur was in the pantry.',
        significance: 'Exonerates Arthur Pendelton from the time of theft.',
        relatedSuspectIds: ['suspect_1'],
      },
      {
        id: 'clue_3',
        title: 'Glass Cutter Scratch',
        description: 'A delicate circular scratch on the cabinet glass.',
        content: 'Cut using a diamond-tipped scalpel from Dr. Vance\'s kit, stolen earlier by Eleanor.',
        significance: 'Explains how the display case was compromised silently.',
        relatedSuspectIds: ['suspect_2', 'suspect_3'],
      },
      {
        id: 'clue_4',
        title: 'Pawn Ticket',
        description: 'A folded slip found in a coat pocket.',
        content: 'Arthur\'s coat contained an unredeemed ticket for his watch, not a gem.',
        significance: 'Confirms Arthur\'s financial distress but rules out ruby possession.',
        relatedSuspectIds: ['suspect_1'],
      },
      {
        id: 'clue_5',
        title: 'Muddy Footprint',
        description: 'A small feminine boot print near the terrace.',
        content: 'Matches size 6 evening boots worn exclusively by Lady Eleanor.',
        significance: 'Establishes the exit trajectory used by the thief.',
        relatedSuspectIds: ['suspect_2'],
      },
    ],
    hints: [
      {
        id: 'hint_1',
        content: 'Examine the alibi of the person seen near the conservatory terrace.',
      },
      {
        id: 'hint_2',
        content: 'The physical dress fibers on the safe hinge eliminate the male suspects.',
      },
    ],
    solution: {
      culpritId: 'suspect_2',
      explanation: 'Lady Eleanor slipped away from the conservatory, cut the safe pane, and took the ruby. Lady Eleanor left behind dress fibers.',
      evidenceIds: ['clue_1', 'clue_3', 'clue_5'],
      reasoningSummary: 'Fibers and footprints decisively identify Lady Eleanor while eliminating Arthur and Dr. Vance.',
    },
  };
}

async function runAllTests() {
  console.log('--- Running AI Mystery Room Verification Suite ---\n');

  // 1. Scoring Tests (§23)
  console.log('Testing Scoring Service (§23):');
  // Medium, correct, 4 clues, 1 hint: 150 + 20 − 10 = 160
  const s1 = computeScore('medium', true, 4, 1);
  assert.equal(s1.base, 150);
  assert.equal(s1.cluePoints, 20);
  assert.equal(s1.hintPenalty, 10);
  assert.equal(s1.final, 160);
  console.log('  ✓ Medium, correct, 4 clues, 1 hint = 160');

  // Medium, incorrect, 4 clues, 1 hint: 0 + 20 − 10 = 10
  const s2 = computeScore('medium', false, 4, 1);
  assert.equal(s2.base, 0);
  assert.equal(s2.cluePoints, 20);
  assert.equal(s2.hintPenalty, 10);
  assert.equal(s2.final, 10);
  console.log('  ✓ Medium, incorrect, 4 clues, 1 hint = 10');

  // Easy, incorrect, 0 clues, 2 hints: max(0, 0 + 0 − 20) = 0
  const s3 = computeScore('easy', false, 0, 2);
  assert.equal(s3.final, 0);
  console.log('  ✓ Easy, incorrect, 0 clues, 2 hints = 0 (floor at 0)');

  // Hard, correct, 9 clues, 3 hints: 200 + 45 - 30 = 215
  const s4 = computeScore('hard', true, 9, 3);
  assert.equal(s4.final, 215);
  console.log('  ✓ Hard, correct, 9 clues, 3 hints = 215');

  // Preview points
  assert.equal(computePreviewPoints(4, 1), 10);
  assert.equal(computePreviewPoints(0, 2), 0);
  console.log('  ✓ Preview points calculation verified');

  // 2. Difficulty Config Tests (§17)
  console.log('\nTesting Difficulty Configuration:');
  assert.equal(DIFFICULTY_CONFIG.easy.suspects, 3);
  assert.equal(DIFFICULTY_CONFIG.easy.clues, 5);
  assert.equal(DIFFICULTY_CONFIG.easy.hints, 2);
  assert.equal(DIFFICULTY_CONFIG.easy.basePoints, 100);

  assert.equal(DIFFICULTY_CONFIG.medium.suspects, 4);
  assert.equal(DIFFICULTY_CONFIG.medium.clues, 7);
  assert.equal(DIFFICULTY_CONFIG.medium.hints, 3);
  assert.equal(DIFFICULTY_CONFIG.medium.basePoints, 150);

  assert.equal(DIFFICULTY_CONFIG.hard.suspects, 5);
  assert.equal(DIFFICULTY_CONFIG.hard.clues, 9);
  assert.equal(DIFFICULTY_CONFIG.hard.hints, 3);
  assert.equal(DIFFICULTY_CONFIG.hard.basePoints, 200);
  console.log('  ✓ Difficulty parameters match specification exactly');

  // 3. Mystery Consistency Validation (§18)
  console.log('\nTesting Consistency Engine (§18):');
  const validMystery = createSampleMystery();
  const v1 = validateMysteryConsistency(validMystery, 'easy');
  assert.equal(v1.isValid, true, `Validation failed unexpectedly: ${v1.errors.join(', ')}`);
  console.log('  ✓ Valid easy mystery passes all 11 rules');

  // Test: count mismatch
  const invalidCounts = JSON.parse(JSON.stringify(validMystery));
  invalidCounts.suspects.pop();
  const v2 = validateMysteryConsistency(invalidCounts, 'easy');
  assert.equal(v2.isValid, false);
  assert.ok(v2.errors.some((e) => e.includes('suspects')));
  console.log('  ✓ Reject suspect count mismatch');

  // Test: hint leaks culprit name
  const leakingHint = JSON.parse(JSON.stringify(validMystery));
  leakingHint.hints[0].content = 'Look into Lady Eleanor because she did it.';
  const v3 = validateMysteryConsistency(leakingHint, 'easy');
  assert.equal(v3.isValid, false);
  assert.ok(v3.errors.some((e) => e.includes('prematurely mentions the culprit')));
  console.log('  ✓ Rejects hint that leaks culprit name');

  // Test: culprit not in suspects
  const badCulprit = JSON.parse(JSON.stringify(validMystery));
  badCulprit.solution.culpritId = 'suspect_99';
  const v4 = validateMysteryConsistency(badCulprit, 'easy');
  assert.equal(v4.isValid, false);
  console.log('  ✓ Rejects culpritId outside suspect roster');

  // 4. Case Store & Privacy Tests (§20, §21, §22, §24)
  console.log('\nTesting CaseStore & Serialization Privacy:');
  const store = new CaseStore();
  const dummyHash = 'dummy_hash_123';
  const caseDoc = await store.createCase(validMystery, 'easy', dummyHash);
  assert.ok(caseDoc.id);
  assert.equal(caseDoc.status, 'active');

  // Verify toPublicCase seals the solution
  const publicCase = toPublicCase(caseDoc);
  assert.equal((publicCase as unknown as { solution?: unknown }).solution, undefined);
  assert.equal(publicCase.clues[0].discovered, false);
  assert.equal(publicCase.clues[0].content, undefined);
  assert.equal(publicCase.hints.length, 0);
  console.log('  ✓ Active public case seals solution, content, and unrequested hints');

  // Discover clue 1
  const disc1 = await store.discoverClue(caseDoc.id, dummyHash, 'clue_1');
  assert.equal(disc1.alreadyDiscovered, false);
  assert.equal(disc1.doc.discoveredClueIds.length, 1);
  assert.equal(disc1.clue.id, 'clue_1');

  // Repeat discovery of clue 1 (idempotency check)
  const disc2 = await store.discoverClue(caseDoc.id, dummyHash, 'clue_1');
  assert.equal(disc2.alreadyDiscovered, true);
  assert.equal(disc2.doc.discoveredClueIds.length, 1);
  console.log('  ✓ Clue discovery is atomic and idempotent');

  // Claim hint 1
  const h1 = await store.claimHint(caseDoc.id, dummyHash);
  assert.equal(h1.hint.index, 1);
  assert.equal(h1.doc.hintsUsed, 1);

  // Claim hint 2 (max hints for easy is 2)
  const h2 = await store.claimHint(caseDoc.id, dummyHash);
  assert.equal(h2.hint.index, 2);
  assert.equal(h2.doc.hintsUsed, 2);

  // Claim hint 3 (should fail with NO_HINTS_REMAINING)
  let hintExhausted = false;
  try {
    await store.claimHint(caseDoc.id, dummyHash);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'NO_HINTS_REMAINING') {
      hintExhausted = true;
    }
  }
  assert.equal(hintExhausted, true);
  console.log('  ✓ Hint claiming enforces sequential limit and cap');

  // Accuse culprit (Lady Eleanor = suspect_2)
  const solvedDoc = await store.accuse(caseDoc.id, dummyHash, 'suspect_2');
  assert.equal(solvedDoc.status, 'completed');
  assert.equal(solvedDoc.verdict, 'correct');
  assert.equal(solvedDoc.score?.base, 100);
  // 1 clue (+5) - 2 hints (-20) = 100 + 5 - 20 = 85
  assert.equal(solvedDoc.score?.final, 85);

  const result = toResult(solvedDoc);
  assert.equal(result.verdict, 'correct');
  assert.equal(result.culprit.id, 'suspect_2');
  assert.equal(result.accusedSuspect.id, 'suspect_2');
  assert.ok(result.explanation.includes('Lady Eleanor'));
  console.log('  ✓ Accusation completes case, reveals solution in result DTO, and scores accurately');

  console.log('\n--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---\n');
}

runAllTests().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});
