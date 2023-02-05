import {performDisablingOperation} from "./coreUtil";
import RevisionManager from "documents/RevisionManager";
import {getActiveSpielName, UNSPECIFIED_NAME} from "persistence/projects";
import {setSpiel} from "persistence/spiels";

export type Revision = {
  spielText:string
}

const DEBOUNCE_SPIEL_TEXT_UPDATE_MS = 1000;

let updateSpielTextTimeout:NodeJS.Timeout|null = null;

async function onPersistRevision(revision:Revision):Promise<void> {
  if (!revision.spielText) return;
  const activeSpielName = await getActiveSpielName();
  if (activeSpielName === UNSPECIFIED_NAME) return;
  await setSpiel(activeSpielName, revision.spielText);
}

export function setUpRevisionForNewSpiel(spielText:string, setRevision:any) {
  const nextRevision:Revision = { spielText };
  revisionManager.clear();
  revisionManager.add(nextRevision);
  setRevision(nextRevision);
}

const revisionManager:RevisionManager<Revision> = new RevisionManager<Revision>(onPersistRevision);

export function getRevisionManager() { return revisionManager; }

export function getRevisionForMount() { return revisionManager.currentRevision; }

export function updateRevisionForSpielText(spielText:string, setSpielText:Function, setRevision:Function) {
  setSpielText(spielText);
  if (updateSpielTextTimeout) { clearTimeout(updateSpielTextTimeout); }
  updateSpielTextTimeout = setTimeout(() => {
    revisionManager.addChanges({spielText});
    setRevision(revisionManager.currentRevision);
  }, DEBOUNCE_SPIEL_TEXT_UPDATE_MS);
}

export async function onUndo(setRevision:Function, setSpielText:Function) {
  await performDisablingOperation(() => {
    revisionManager.prev();
    const revision = revisionManager.currentRevision;
    setRevision(revision);
    setSpielText(revision?.spielText ?? '');
  });
}

export async function onRedo(setRevision:Function, setSpielText:Function) {
  await performDisablingOperation(() => {
    revisionManager.next();
    const revision = revisionManager.currentRevision;
    setRevision(revision);
    setSpielText(revision?.spielText ?? '');
  });
}