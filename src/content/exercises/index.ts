import { phase1Exercises } from "./phase1";
import { phase2Exercises } from "./phase2";
import { phase3Exercises } from "./phase3";
import { phase4Exercises } from "./phase4";
import { phase5Exercises } from "./phase5";
import { phase6Exercises } from "./phase6";
import type { ExerciseSet } from "../types";

export { phase1Exercises } from "./phase1";
export { phase2Exercises } from "./phase2";
export { phase3Exercises } from "./phase3";
export { phase4Exercises } from "./phase4";
export { phase5Exercises } from "./phase5";
export { phase6Exercises } from "./phase6";

export const allExercises: ExerciseSet[] = [
  ...phase1Exercises,
  ...phase2Exercises,
  ...phase3Exercises,
  ...phase4Exercises,
  ...phase5Exercises,
  ...phase6Exercises,
];

export function getExercisesByPhase(phaseId: number): ExerciseSet[] {
  return allExercises.filter((e) => e.phaseId === phaseId);
}
