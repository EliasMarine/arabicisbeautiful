import { phase1Culture } from "./phase1";
import { phase6Culture } from "./phase6";
import type { CultureNote } from "../types";

export { phase1Culture } from "./phase1";
export { phase6Culture } from "./phase6";

export const allCulture: CultureNote[] = [
  ...phase1Culture,
  ...phase6Culture,
];

export function getCultureByPhase(phaseId: number): CultureNote[] {
  return allCulture.filter((c) => c.phaseId === phaseId);
}
