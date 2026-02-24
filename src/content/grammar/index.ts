import { phase1Grammar } from "./phase1";
import { phase2Grammar, phase2PhrasePatterns } from "./phase2";
import { phase3Grammar } from "./phase3";
import { phase4Grammar } from "./phase4";
import { phase5Grammar } from "./phase5";
import { phase6Grammar } from "./phase6";
import type { GrammarRule, PhrasePatternsGroup } from "../types";

export { phase1Grammar } from "./phase1";
export { phase2Grammar, phase2PhrasePatterns } from "./phase2";
export { phase3Grammar } from "./phase3";
export { phase4Grammar } from "./phase4";
export { phase5Grammar } from "./phase5";
export { phase6Grammar } from "./phase6";

export const allGrammar: GrammarRule[] = [
  ...phase1Grammar,
  ...phase2Grammar,
  ...phase3Grammar,
  ...phase4Grammar,
  ...phase5Grammar,
  ...phase6Grammar,
];

export const allPhrasePatterns: PhrasePatternsGroup[] = [
  ...phase2PhrasePatterns,
];

export function getGrammarByPhase(phaseId: number): GrammarRule[] {
  return allGrammar.filter((g) => g.phaseId === phaseId);
}
