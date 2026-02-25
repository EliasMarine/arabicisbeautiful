import { phase1Shadowing } from "./phase1";
import { phase2Shadowing } from "./phase2";
import { phase3Shadowing } from "./phase3";
import type { ShadowingItem } from "../types";

export { phase1Shadowing } from "./phase1";
export { phase2Shadowing } from "./phase2";
export { phase3Shadowing } from "./phase3";

export const allShadowing: ShadowingItem[] = [
  ...phase1Shadowing,
  ...phase2Shadowing,
  ...phase3Shadowing,
];

export function getShadowingByPhase(phaseId: number): ShadowingItem[] {
  return allShadowing.filter((s) => {
    const prefix = `p${phaseId}-`;
    return s.id.startsWith(prefix);
  });
}
