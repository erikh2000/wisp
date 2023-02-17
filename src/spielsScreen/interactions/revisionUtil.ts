import {performDisablingOperation} from "./coreUtil";
import RevisionManager from "documents/RevisionManager";
import {getActiveSpielName, UNSPECIFIED_NAME} from "persistence/projects";
import {setSpiel} from "persistence/spiels";

import { Spiel, importSpielFile, exportSpielFile } from 'sl-spiel';

export type Revision = {
  spiel:Spiel
}

async function onPersistRevision(revision:Revision):Promise<void> {
  if (!revision.spiel) return;
  const activeSpielName = await getActiveSpielName();
  if (activeSpielName === UNSPECIFIED_NAME) return;
  const spielText = exportSpielFile(revision.spiel);
  await setSpiel(activeSpielName, spielText);
}

export function setUpRevisionForNewSpiel(spielText:string, setRevision:any) {
  const spiel = importSpielFile(spielText);
  const nextRevision:Revision = { spiel };
  revisionManager.clear();
  revisionManager.add(nextRevision);
  setRevision(nextRevision);
}

const revisionManager:RevisionManager<Revision> = new RevisionManager<Revision>(onPersistRevision);

export function getRevisionManager() { return revisionManager; }

export function getRevisionForMount():Revision {
  const revision = revisionManager.currentRevision;
  if (revision) return revision;
  const newRevision = { spiel: new Spiel() };
  revisionManager.add(newRevision);
  return newRevision;
}

export function updateRevisionForSpiel(spiel:Spiel, setRevision:Function) {
  const nextSpiel = spiel.duplicate();
  revisionManager.addChanges({spiel:nextSpiel});
  setRevision(revisionManager.currentRevision);
}

export async function onUndo(setRevision:Function) {
  await performDisablingOperation(() => {
    revisionManager.prev();
    const revision = revisionManager.currentRevision;
    setRevision(revision);
  });
}

export async function onRedo(setRevision:Function) {
  await performDisablingOperation(() => {
    revisionManager.next();
    const revision = revisionManager.currentRevision;
    setRevision(revision);
  });
}