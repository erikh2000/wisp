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
  const _revisionManager = getRevisionManager();
  _revisionManager.clear(nextRevision);
  setRevision(nextRevision);
}

let revisionManager:RevisionManager<Revision>|null = null;

export function initRevisionManager(spiel:Spiel) {
  const initialRevision:Revision = { spiel };
  revisionManager = new RevisionManager<Revision>(initialRevision, onPersistRevision);
}

export function getRevisionManager():RevisionManager<Revision> {
  if (!revisionManager) throw new Error('call initRevisionManager() first');
  return revisionManager; 
}

export function getRevisionForMount():Revision {
  return revisionManager ? revisionManager.currentRevision : { spiel: new Spiel() };
}

export function updateRevisionForSpiel(spiel:Spiel, setRevision:Function) {
  const nextSpiel = spiel.duplicate();
  const _revisionManager = getRevisionManager();
  _revisionManager.addChanges({spiel:nextSpiel});
  setRevision(_revisionManager.currentRevision);
}

export async function onUndo(setRevision:Function) {
  await performDisablingOperation(() => {
    const _revisionManager = getRevisionManager();
    _revisionManager.prev();
    setRevision(_revisionManager.currentRevision);
  });
}

export async function onRedo(setRevision:Function) {
  await performDisablingOperation(() => {
    const _revisionManager = getRevisionManager();
    _revisionManager.next();
    setRevision(_revisionManager.currentRevision);
  });
}