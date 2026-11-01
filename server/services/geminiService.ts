import { GoogleGenAI } from '@google/genai';
import { DIFFICULTY_CONFIG, type DifficultyLevel } from '../config/difficulty.ts';
import type { GeneratedMystery } from '../schemas/mysterySchemas.ts';
import { validateMysteryConsistency } from './validationService.ts';
import { ApiError } from '../utils/apiError.ts';
import { buildThemedMysteryFallback } from './fallbackMysteryGenerator.ts';

const MAX_GENERATION_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = process.env.GEMINI_TIMEOUT_MS
  ? parseInt(process.env.GEMINI_TIMEOUT_MS, 10)
  : 90000;

function buildGenerationPrompt(premise: string, difficulty: DifficultyLevel, correctiveFeedback?: string[]): string {
  const config = DIFFICULTY_CONFIG[difficulty];

  let prompt = `You are an expert detective mystery architect.
Create a solvable, logically tight, fair-play mystery case based strictly on this premise. Keep narrative prose concise, atmospheric, and high-impact.

<<<PLAYER_PREMISE_START>>>
${premise.trim()}
<<<PLAYER_PREMISE_END>>>

DIFFICULTY REQUIREMENTS (STRICT):
- Difficulty level: "${difficulty}"
- Exactly ${config.suspects} suspects (IDs: ${Array.from({ length: config.suspects }, (_, i) => `"suspect_${i + 1}"`).join(', ')})
- Exactly ${config.clues} clues (IDs: ${Array.from({ length: config.clues }, (_, i) => `"clue_${i + 1}"`).join(', ')})
- Exactly ${config.hints} hints (IDs: ${Array.from({ length: config.hints }, (_, i) => `"hint_${i + 1}"`).join(', ')})
- Exactly 1 culprit chosen from the suspects.
- The solution's evidenceIds MUST contain at least ${config.minEvidenceIds} clue IDs that together decisively prove the culprit's guilt.

CRITICAL NARRATIVE & FAIR-PLAY RULES:
1. Every suspect must have a plausible background, a distinct motive, and an initial alibi.
2. Clues have:
   - "title": Short catchy label (e.g. "Torn Silk Scarf", "Encrypted USB Drive", "Shattered Pocket Watch")
   - "description": A tantalizing teaser/preview that DOES NOT reveal the full forensic finding or accuse the culprit.
   - "content": Detailed investigative findings revealed only when the player discovers the clue.
   - "significance": The deeper explanation of how this clue connects to the case (revealed in the post-game verdict).
   - "relatedSuspectIds": Array of suspect IDs connected to this clue. EVERY suspect must appear in at least one clue's relatedSuspectIds!
3. Hints must be sequential:
   - Hint 1: Focuses on narrowing down suspect motives or timelines.
   - Subsequent hints guide attention to key contradictions in clues.
   - HINTS MUST NEVER MENTION THE CULPRIT'S NAME OR ID!
4. The solution must contain:
   - "culpritId": The suspect_N ID of the sole guilty person.
   - "explanation": Comprehensive narrative explaining how the crime occurred, step-by-step. MUST explicitly mention the culprit's full name.
   - "evidenceIds": Array of clue IDs that substantiate this conviction (at least ${config.minEvidenceIds}).
   - "reasoningSummary": Concise logical deduction summarizing why the evidence eliminates other suspects and singles out the culprit. MUST explicitly mention the culprit's name.
5. All text fields must be sanitized plain text without raw HTML or markup.

OUTPUT FORMAT:
Output JSON ONLY adhering strictly to this schema:
{
  "title": "string (The Case of ...)",
  "premise": "${premise.trim().replace(/"/g, '\\"')}",
  "story": "string (Atmospheric 200-350 word case introduction establishing the crime scene, discovery, and stake)",
  "suspects": [
    { "id": "suspect_1", "name": "...", "background": "...", "motive": "...", "alibi": "..." }
  ],
  "clues": [
    { "id": "clue_1", "title": "...", "description": "...", "content": "...", "significance": "...", "relatedSuspectIds": ["suspect_1"] }
  ],
  "hints": [
    { "id": "hint_1", "content": "..." }
  ],
  "solution": {
    "culpritId": "suspect_1",
    "explanation": "...",
    "evidenceIds": ["clue_1", "clue_2", "clue_3"],
    "reasoningSummary": "..."
  }
}
`;

  if (correctiveFeedback && correctiveFeedback.length > 0) {
    prompt += `\n\nATTENTION! Your previous attempt had the following validation errors. Correct all of them in this output:\n- ${correctiveFeedback.join('\n- ')}\n`;
  }

  return prompt;
}

export async function generateMysteryWithGemini(
  premise: string,
  difficulty: DifficultyLevel
): Promise<GeneratedMystery> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Gemini] GEMINI_API_KEY not configured. Using high-fidelity procedural case generator.');
    return buildThemedMysteryFallback(premise, difficulty);
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  let lastErrors: string[] = [];

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
    const prompt = buildGenerationPrompt(
      premise,
      difficulty,
      attempt > 1 ? lastErrors : undefined
    );

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI_TIMEOUT')), 30000)
      );

      const responsePromise = ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const response = await Promise.race([responsePromise, timeoutPromise]);
      const rawText = response.text?.trim() || '';

      if (!rawText) {
        lastErrors = ['Empty response returned by model'];
        continue;
      }

      // Parse JSON
      let parsedJson: unknown;
      try {
        const cleanedText = rawText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/, '');
        parsedJson = JSON.parse(cleanedText);
      } catch (err) {
        lastErrors = [`Invalid JSON returned: ${(err as Error).message}`];
        continue;
      }

      // Validate against all 11 consistency rules
      const validation = validateMysteryConsistency(parsedJson, difficulty);
      if (validation.isValid && validation.validatedMystery) {
        return validation.validatedMystery;
      }

      lastErrors = validation.errors;
    } catch (err: unknown) {
      const error = err as Error;
      console.warn(`[Gemini Attempt ${attempt}] Notice: ${error.message}`);
      lastErrors = [error.message || 'Generation issue'];
    }
  }

  // Graceful fallback to guarantee zero downtime for the player
  console.info('[Mystery Engine] Activating procedural fair-play case architect for immediate play.');
  return buildThemedMysteryFallback(premise, difficulty);
}
