import { quickRun } from "./quickRun";
import { createDefaultProjectIfMissing } from "persistence/projects";

// Top-level initialization for the app that occurs once before the first render.
export async function init() {
  quickRun();
  
  await createDefaultProjectIfMissing();
}