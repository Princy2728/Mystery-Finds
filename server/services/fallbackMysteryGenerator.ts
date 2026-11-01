import { DIFFICULTY_CONFIG, type DifficultyLevel } from '../config/difficulty.ts';
import type { GeneratedMystery } from '../schemas/mysterySchemas.ts';
import { validateMysteryConsistency } from './validationService.ts';

interface ThemePreset {
  victimOrItem: string;
  setting: string;
  suspectPool: Array<{ name: string; role: string; motiveTpl: string; alibiTpl: string }>;
  clueTemplates: Array<{ title: string; descTpl: string; contentTpl: string; sigTpl: string }>;
}

const THEMES: ThemePreset[] = [
  {
    victimOrItem: 'Valuable Object or Asset',
    setting: 'High-Security Estate or Venue',
    suspectPool: [
      {
        name: 'Julian Sterling',
        role: 'Chief Security Officer with master keycard clearance',
        motiveTpl: 'Mounting secret debts and recent threats of termination.',
        alibiTpl: 'Claims to have been conducting physical perimeter rounds outside.',
      },
      {
        name: 'Victoria Vance',
        role: 'Senior Appraiser and lead forensic cataloger',
        motiveTpl: 'Furious over disputed provenance royalties and imminent audit.',
        alibiTpl: 'Claims to have been reviewing archival manifests in the basement.',
      },
      {
        name: 'Marcus Holloway',
        role: 'Visiting Patron and tech investor',
        motiveTpl: 'Seeking proprietary leverage to rescue his collapsing portfolio.',
        alibiTpl: 'Claims to have been on a private international conference call.',
      },
      {
        name: 'Elena Rostova',
        role: 'Private Secretary with confidential schedule access',
        motiveTpl: 'Blackmailed regarding an expunged prior identity.',
        alibiTpl: 'Claims to have been drafting correspondence in the adjacent anteroom.',
      },
      {
        name: 'Arthur Pendelton',
        role: 'Head Custodian with after-hours ventilation access',
        motiveTpl: 'Disgruntled over pension cancellations and overlooked tenure.',
        alibiTpl: 'Claims to have been replacing filter units in the furnace room.',
      },
    ],
    clueTemplates: [
      {
        title: 'Tampered Terminal Log',
        descTpl: 'A digital access record with timestamp discrepancies near the scene.',
        contentTpl: 'Security records show an override keycard was used precisely at 23:42, wiping local sensor feeds.',
        sigTpl: 'Directly proves access by someone possessing master clearance bypass codes.',
      },
      {
        title: 'Smudged Silk Glove',
        descTpl: 'A discarded glove found tucked beneath an air intake vent.',
        contentTpl: 'Forensic inspection detects trace residues of the safe locking lubricant and micro-fibers.',
        sigTpl: 'Confirms the perpetrator used the duct corridor to circumvent hallway motion sensors.',
      },
      {
        title: 'Encrypted Flash Drive',
        descTpl: 'A miniature drive dropped behind a velvet drapery.',
        contentTpl: 'Contains copied floor schematics and vault wiring diagrams downloaded forty-eight hours prior.',
        sigTpl: 'Indicates premeditated surveillance and technical knowledge of the venue layout.',
      },
      {
        title: 'Fabric Thread Snag',
        descTpl: 'A singular colored thread snagged on the safe door latch.',
        contentTpl: 'Matches the exact tailored weave worn by the chief suspect during the evening.',
        sigTpl: 'Conclusive physical evidence placing the culprit in immediate contact with the vault latch.',
      },
      {
        title: 'Alibi Phone Record',
        descTpl: 'Cellular network tower logs covering the critical window.',
        contentTpl: 'Tower triangulation confirms the alleged call was unanswered and lasted only four seconds.',
        sigTpl: 'Shatters the primary alibi timeline claimed during initial interrogation.',
      },
      {
        title: 'Security Camera Glitch',
        descTpl: 'A repeated loop sequence detected in camera sector four.',
        contentTpl: 'A looping script was launched from an internal workstation fifteen minutes prior to the theft.',
        sigTpl: 'Demonstrates insider coordination and direct terminal intervention.',
      },
      {
        title: 'Counterfeit Replica Cast',
        descTpl: 'A lightweight composite mold found in a service locker.',
        contentTpl: 'Designed to match the weight displacement sensors, preventing automated pressure alarms.',
        sigTpl: 'Shows the perpetrator had exact dimensional measurements of the target beforehand.',
      },
      {
        title: 'Pawnshop Courier Receipt',
        descTpl: 'A stamped dispatch manifest hidden in a waste receptacle.',
        contentTpl: 'Records a scheduled courier pickup set for 06:00 the following morning to an offshore address.',
        sigTpl: 'Reveals the immediate fencing route planned to move the stolen item out of jurisdiction.',
      },
      {
        title: 'Muddy Exterior Footprint',
        descTpl: 'A faint boot impression left near the auxiliary terrace gate.',
        contentTpl: 'Tread analysis reveals specialized non-slip soles standard to authorized maintenance gear.',
        sigTpl: 'Identifies the precise exit egress used to avoid front-gate security checkpoints.',
      },
    ],
  },
];

export function buildThemedMysteryFallback(
  premise: string,
  difficulty: DifficultyLevel
): GeneratedMystery {
  const config = DIFFICULTY_CONFIG[difficulty];
  const theme = THEMES[0];

  // Pick suspects
  const chosenSuspects = theme.suspectPool.slice(0, config.suspects).map((s, idx) => ({
    id: `suspect_${idx + 1}`,
    name: s.name,
    background: `${s.role}. Longstanding associate connected to the location and principal parties.`,
    motive: s.motiveTpl,
    alibi: s.alibiTpl,
  }));

  // Designate culprit (suspect_2)
  const culprit = chosenSuspects[1];

  // Pick clues
  const chosenClues = theme.clueTemplates.slice(0, config.clues).map((c, idx) => {
    // Distribute related suspects so EVERY suspect appears at least once
    const relatedIdx = idx % chosenSuspects.length;
    const secondaryIdx = (idx + 1) % chosenSuspects.length;
    const related = [chosenSuspects[relatedIdx].id];
    if (secondaryIdx !== relatedIdx) {
      related.push(chosenSuspects[secondaryIdx].id);
    }

    return {
      id: `clue_${idx + 1}`,
      title: c.title,
      description: `${c.descTpl} Found during forensic sweeping of the crime scene.`,
      content: `${c.contentTpl} Detailed analysis confirms clear links to the case timeline.`,
      significance: `${c.sigTpl} Links the physical timeline of the incident together.`,
      relatedSuspectIds: related,
    };
  });

  // Ensure culprit is linked to key clues
  chosenClues[0].relatedSuspectIds = [culprit.id, chosenSuspects[0].id];
  chosenClues[1].relatedSuspectIds = [culprit.id];
  chosenClues[3].relatedSuspectIds = [culprit.id];

  // Evidence IDs
  const evidenceIds = chosenClues.slice(0, config.minEvidenceIds).map((c) => c.id);

  // Hints
  const allHints = [
    {
      id: 'hint_1',
      content: 'Focus your attention on the person whose alibi relies on unsupervised solo tasks in the basement or archives.',
    },
    {
      id: 'hint_2',
      content: 'The fabric fibers and terminal override logs point away from exterior intruders toward a specialist with internal access.',
    },
    {
      id: 'hint_3',
      content: 'Cross-reference the catalog measurements with the counterfeit cast to single out the appraisal specialist.',
    },
  ];
  const hints = allHints.slice(0, config.hints).map((h, idx) => ({
    id: `hint_${idx + 1}`,
    content: h.content,
  }));

  const cleanedPremise = premise.trim();
  const title = `The Mystery of ${cleanedPremise.slice(0, 45).replace(/[.,]/g, '')}`;

  const story = `The quiet of the evening was abruptly shattered when alarms sounded across the estate. Regarding the incident: "${cleanedPremise}". Investigators arrived to discover key security checkpoints disabled and the crime completed with forensic precision. Initial interrogations have isolated a select circle of persons of interest, each with conflicting narratives, suspicious alibis, and hidden motives. It falls to you, Detective, to examine the physical clues, pierce through the falsehoods, and bring the true perpetrator to justice.`;

  const explanation = `${culprit.name} orchestrated the crime by taking advantage of specialized cataloging access and internal clearance. ${culprit.name} prepared the bypass codes ahead of time, retrieved the target item, and planted misleading evidence. Physical thread fibers and access logs ultimately exposed ${culprit.name} as the sole architect behind the operation.`;

  const reasoningSummary = `Forensic fiber matching and falsified phone timestamps eliminate other suspects and conclusively demonstrate that ${culprit.name} executed the crime alone.`;

  const mystery: GeneratedMystery = {
    title,
    premise: cleanedPremise,
    story,
    suspects: chosenSuspects,
    clues: chosenClues,
    hints,
    solution: {
      culpritId: culprit.id,
      explanation,
      evidenceIds,
      reasoningSummary,
    },
  };

  const validation = validateMysteryConsistency(mystery, difficulty);
  if (!validation.isValid) {
    throw new Error(`Fallback generator validation failed: ${validation.errors.join('; ')}`);
  }

  return mystery;
}
