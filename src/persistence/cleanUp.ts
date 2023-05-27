import {deleteUnusedSpeech} from "./speech";

export async function cleanUp() {
  await deleteUnusedSpeech();
}