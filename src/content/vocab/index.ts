import { phase1Vocab } from "./phase1";
import { phase2Vocab } from "./phase2";
import { phase3Vocab } from "./phase3";
import { phase4Vocab } from "./phase4";
import { phase5Vocab } from "./phase5";
import { phase6Vocab } from "./phase6";
import type { VocabItem } from "../types";

export { phase1Vocab } from "./phase1";
export { phase2Vocab } from "./phase2";
export { phase3Vocab } from "./phase3";
export { phase4Vocab } from "./phase4";
export { phase5Vocab } from "./phase5";
export { phase6Vocab } from "./phase6";

export const allVocab: VocabItem[] = [
  ...phase1Vocab,
  ...phase2Vocab,
  ...phase3Vocab,
  ...phase4Vocab,
  ...phase5Vocab,
  ...phase6Vocab,
];

export function getVocabByPhase(phaseId: number): VocabItem[] {
  return allVocab.filter((v) => v.phaseId === phaseId);
}

export function getVocabByCategory(category: string): VocabItem[] {
  return allVocab.filter((v) => v.category === category);
}
