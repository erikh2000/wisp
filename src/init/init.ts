import { quickRun } from "./quickRun";
import {cleanUp} from "persistence/cleanUp";
import { createDefaultProjectIfMissing } from "persistence/projects";

// Top-level initialization for the app that occurs once before the first render.
export async function init() {
  quickRun();
  
  await cleanUp();
  await createDefaultProjectIfMissing();
}