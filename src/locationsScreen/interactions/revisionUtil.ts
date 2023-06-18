import {performDisablingOperation} from "./coreUtil";
import RevisionManager from "documents/RevisionManager";

export type FacePlacement = {
  characterName:string,
  x:number,
  y:number,
  w:number,
  h:number
}

export type Revision = {
  backgroundImage:ImageBitmap|null,
  facePlacements:FacePlacement[],
  selectedFaceNo:number
}

const UNSELECTED = -1;

async function onPersistRevision(revision:Revision):Promise<void> {
  // TODO
}

export function createDefaultRevision():Revision {
  return {
    backgroundImage:null,
    facePlacements:[],
    selectedFaceNo:UNSELECTED
  };
}

const revisionManager:RevisionManager<Revision> = new RevisionManager<Revision>(createDefaultRevision(), onPersistRevision);

export function getRevisionManager() { return revisionManager; }

export function getRevisionForMount():Revision {
  return revisionManager.currentRevision;
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

export function updateUndoRedoDisabled(disabled:boolean, setUndoDisabled:Function, setRedoDisabled:Function) {
  if (!revisionManager) disabled = true;
  setUndoDisabled(disabled || !revisionManager?.hasPrev);
  setRedoDisabled(disabled || !revisionManager?.hasNext);
}