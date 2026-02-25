import { phase1Verbs } from "./phase1";
import { phase2Verbs } from "./phase2";
import { phase3Verbs } from "./phase3";
import type { VerbConjugation } from "../types";

export { phase1Verbs } from "./phase1";
export { phase2Verbs } from "./phase2";
export { phase3Verbs } from "./phase3";

export const allVerbs: VerbConjugation[] = [
  ...phase1Verbs,
  ...phase2Verbs,
  ...phase3Verbs,
];

export function getVerbsByPhase(phaseId: number): VerbConjugation[] {
  return allVerbs.filter((v) => v.phaseId === phaseId);
}
