import { phase1Dialogues } from "./phase1";
import { phase2Dialogues } from "./phase2";
import { phase3Dialogues } from "./phase3";
import { phase4Dialogues } from "./phase4";
import { phase5Dialogues } from "./phase5";
import { phase6Dialogues } from "./phase6";
import type { Dialogue } from "../types";

export { phase1Dialogues } from "./phase1";
export { phase2Dialogues } from "./phase2";
export { phase3Dialogues } from "./phase3";
export { phase4Dialogues } from "./phase4";
export { phase5Dialogues } from "./phase5";
export { phase6Dialogues } from "./phase6";

export const allDialogues: Dialogue[] = [
  ...phase1Dialogues,
  ...phase2Dialogues,
  ...phase3Dialogues,
  ...phase4Dialogues,
  ...phase5Dialogues,
  ...phase6Dialogues,
];

export function getDialoguesByPhase(phaseId: number): Dialogue[] {
  return allDialogues.filter((d) => d.phaseId === phaseId);
}
