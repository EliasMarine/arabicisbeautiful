import { phase1Culture } from "./phase1";
import { phase2Culture } from "./phase2";
import { phase3Culture } from "./phase3";
import { phase4Culture } from "./phase4";
import { phase5Culture } from "./phase5";
import { phase6Culture } from "./phase6";
import type { CultureNote } from "../types";

export { phase1Culture } from "./phase1";
export { phase2Culture } from "./phase2";
export { phase3Culture } from "./phase3";
export { phase4Culture } from "./phase4";
export { phase5Culture } from "./phase5";
export { phase6Culture } from "./phase6";

export const allCulture: CultureNote[] = [
  ...phase1Culture,
  ...phase2Culture,
  ...phase3Culture,
  ...phase4Culture,
  ...phase5Culture,
  ...phase6Culture,
];

export function getCultureByPhase(phaseId: number): CultureNote[] {
  return allCulture.filter((c) => c.phaseId === phaseId);
}
