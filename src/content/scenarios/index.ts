import { phase2Scenarios } from "./phase2";
import { phase3Scenarios } from "./phase3";
import { phase4Scenarios } from "./phase4";
import type { ScenarioLesson } from "../types";

export { phase2Scenarios } from "./phase2";
export { phase3Scenarios } from "./phase3";
export { phase4Scenarios } from "./phase4";

export const allScenarios: ScenarioLesson[] = [
  ...phase2Scenarios,
  ...phase3Scenarios,
  ...phase4Scenarios,
];

export function getScenariosByPhase(phaseId: number): ScenarioLesson[] {
  return allScenarios.filter((s) => s.phaseId === phaseId);
}
