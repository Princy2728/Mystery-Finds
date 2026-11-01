import { DIFFICULTY_CONFIG, type DifficultyLevel } from '../config/difficulty.ts';
import { type GeneratedMystery, MysteryGenerationSchema } from '../schemas/mysterySchemas.ts';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateMysteryConsistency(
  data: unknown,
  difficulty: DifficultyLevel
): { isValid: boolean; errors: string[]; validatedMystery?: GeneratedMystery } {
  const errors: string[] = [];

  // Step 1: Zod validation
  const parsed = MysteryGenerationSchema.safeParse(data);
  if (!parsed.success) {
    const formattedErrors = parsed.error.issues.map(
      (iss) => `${iss.path.join('.') || 'root'}: ${iss.message}`
    );
    return { isValid: false, errors: formattedErrors };
  }

  const mystery = parsed.data;
  const config = DIFFICULTY_CONFIG[difficulty];

  // Rule 2: Suspect/clue/hint counts exactly match the difficulty
  if (mystery.suspects.length !== config.suspects) {
    errors.push(
      `Expected exactly ${config.suspects} suspects for difficulty '${difficulty}', but received ${mystery.suspects.length}`
    );
  }
  if (mystery.clues.length !== config.clues) {
    errors.push(
      `Expected exactly ${config.clues} clues for difficulty '${difficulty}', but received ${mystery.clues.length}`
    );
  }
  if (mystery.hints.length !== config.hints) {
    errors.push(
      `Expected exactly ${config.hints} hints for difficulty '${difficulty}', but received ${mystery.hints.length}`
    );
  }

  // Rule 3: IDs match format and are unique
  const suspectIds = new Set<string>();
  for (const s of mystery.suspects) {
    if (suspectIds.has(s.id)) {
      errors.push(`Duplicate suspect ID: ${s.id}`);
    }
    suspectIds.add(s.id);
  }

  const clueIds = new Set<string>();
  for (const c of mystery.clues) {
    if (clueIds.has(c.id)) {
      errors.push(`Duplicate clue ID: ${c.id}`);
    }
    clueIds.add(c.id);
  }

  const hintIds = new Set<string>();
  for (const h of mystery.hints) {
    if (hintIds.has(h.id)) {
      errors.push(`Duplicate hint ID: ${h.id}`);
    }
    hintIds.add(h.id);
  }

  // Rule 4: culpritId refers to an existing suspect
  const culprit = mystery.suspects.find((s) => s.id === mystery.solution.culpritId);
  if (!culprit) {
    errors.push(`solution.culpritId '${mystery.solution.culpritId}' is not among defined suspects`);
  }

  // Rule 5: Every evidenceIds and relatedSuspectIds entry refers to existing clue/suspect
  const evidenceIdSet = new Set<string>();
  for (const evId of mystery.solution.evidenceIds) {
    if (!clueIds.has(evId)) {
      errors.push(`solution.evidenceIds contains non-existent clue ID: ${evId}`);
    }
    if (evidenceIdSet.has(evId)) {
      errors.push(`Duplicate clue ID in solution.evidenceIds: ${evId}`);
    }
    evidenceIdSet.add(evId);
  }

  for (const c of mystery.clues) {
    for (const sId of c.relatedSuspectIds) {
      if (!suspectIds.has(sId)) {
        errors.push(`Clue '${c.id}' references non-existent suspect ID '${sId}'`);
      }
    }
  }

  // Rule 6: evidenceIds has at least the minimum count for the difficulty, with no duplicates
  if (evidenceIdSet.size < config.minEvidenceIds) {
    errors.push(
      `Expected at least ${config.minEvidenceIds} evidenceIds for difficulty '${difficulty}', got ${evidenceIdSet.size}`
    );
  }

  // Rule 7: explanation and reasoningSummary mention the culprit's name, and do not name any other suspect as culprit
  if (culprit) {
    const culpritNameLower = culprit.name.toLowerCase();
    const explanationLower = mystery.solution.explanation.toLowerCase();
    const reasoningLower = mystery.solution.reasoningSummary.toLowerCase();

    if (!explanationLower.includes(culpritNameLower)) {
      errors.push(`solution.explanation must mention culprit's name (${culprit.name})`);
    }
    if (!reasoningLower.includes(culpritNameLower)) {
      errors.push(`solution.reasoningSummary must mention culprit's name (${culprit.name})`);
    }

    // Ensure other suspects are not falsely designated as the culprit
    const otherSuspects = mystery.suspects.filter((s) => s.id !== culprit.id);
    for (const other of otherSuspects) {
      const otherNameLower = other.name.toLowerCase();
      // Look for phrasing like "John is the murderer" / "John was the culprit"
      const culpritPhrases = [
        `${otherNameLower} is the culprit`,
        `${otherNameLower} was the culprit`,
        `${otherNameLower} is the killer`,
        `${otherNameLower} was the killer`,
        `${otherNameLower} committed the crime`,
      ];
      for (const phrase of culpritPhrases) {
        if (explanationLower.includes(phrase) || reasoningLower.includes(phrase)) {
          errors.push(`Explanation falsely references other suspect '${other.name}' as the culprit`);
        }
      }
    }
  }

  // Rule 8: Hints do not contain the culprit's name or ID (case-insensitive)
  if (culprit) {
    const culpritNameLower = culprit.name.toLowerCase();
    const culpritIdLower = culprit.id.toLowerCase();

    mystery.hints.forEach((hint, idx) => {
      const hintContentLower = hint.content.toLowerCase();
      if (hintContentLower.includes(culpritNameLower) || hintContentLower.includes(culpritIdLower)) {
        errors.push(`Hint #${idx + 1} (${hint.id}) prematurely mentions the culprit's name or ID`);
      }
    });
  }

  // Rule 9: Teaser description fields do not contain culprit's name in accusatory form and do not duplicate content
  if (culprit) {
    const culpritNameLower = culprit.name.toLowerCase();
    mystery.clues.forEach((clue) => {
      const descLower = clue.description.toLowerCase();
      if (
        descLower.includes(`${culpritNameLower} did it`) ||
        descLower.includes(`${culpritNameLower} is guilty`) ||
        descLower.includes(`murderer ${culpritNameLower}`) ||
        descLower.includes(`culprit ${culpritNameLower}`)
      ) {
        errors.push(`Clue teaser '${clue.id}' prematurely accuses culprit '${culprit.name}'`);
      }
      if (clue.description.trim() === clue.content.trim()) {
        errors.push(`Clue '${clue.id}' description cannot be identical to its full content`);
      }
    });
  }

  // Rule 10: Every suspect appears in at least one clue's relatedSuspectIds
  const mentionedSuspects = new Set<string>();
  mystery.clues.forEach((c) => {
    c.relatedSuspectIds.forEach((sId) => mentionedSuspects.add(sId));
  });

  for (const sId of suspectIds) {
    if (!mentionedSuspects.has(sId)) {
      errors.push(`Suspect '${sId}' does not appear in any clue's relatedSuspectIds`);
    }
  }

  // Rule 11: Text fields are non-empty after trimming and contain no raw markup/HTML
  const htmlTagRegex = /<\/?[a-z][\s\S]*>/i;
  const checkText = (text: string, path: string) => {
    if (text.trim().length === 0) {
      errors.push(`${path} is empty after trimming`);
    }
    if (htmlTagRegex.test(text)) {
      errors.push(`${path} contains raw HTML/markup tags`);
    }
  };

  checkText(mystery.title, 'title');
  checkText(mystery.story, 'story');
  mystery.suspects.forEach((s) => {
    checkText(s.name, `suspects.${s.id}.name`);
    checkText(s.background, `suspects.${s.id}.background`);
    checkText(s.motive, `suspects.${s.id}.motive`);
    checkText(s.alibi, `suspects.${s.id}.alibi`);
  });
  mystery.clues.forEach((c) => {
    checkText(c.title, `clues.${c.id}.title`);
    checkText(c.description, `clues.${c.id}.description`);
    checkText(c.content, `clues.${c.id}.content`);
    checkText(c.significance, `clues.${c.id}.significance`);
  });
  mystery.hints.forEach((h) => {
    checkText(h.content, `hints.${h.id}.content`);
  });
  checkText(mystery.solution.explanation, 'solution.explanation');
  checkText(mystery.solution.reasoningSummary, 'solution.reasoningSummary');

  return {
    isValid: errors.length === 0,
    errors,
    validatedMystery: errors.length === 0 ? mystery : undefined,
  };
}
