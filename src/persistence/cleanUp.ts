import {deleteUnusedSpeech} from "./speech";
import {deleteUnusedLocationImages} from "./locations";

export async function cleanUp() {
  await deleteUnusedSpeech();
  await deleteUnusedLocationImages();
}