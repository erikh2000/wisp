import {performDisablingOperation} from "./coreUtil";
import RevisionManager from "documents/RevisionManager";
import {UNSPECIFIED_IMAGE_KEY} from "persistence/imageUtil";
import {setLocation} from "persistence/locations";
import {getActiveLocationName} from "persistence/projects";
import Location from "persistence/types/Location";

export type Revision = {
  location:Location,
  selectedFaceNo:number
}

export const UNSELECTED = -1;

async function onPersistRevision(revision:Revision):Promise<void> {
  const locationName = await getActiveLocationName();
  await setLocation(locationName, revision.location);
}

export function createDefaultRevision():Revision {
  return {
    location:{backgroundImageKey:UNSPECIFIED_IMAGE_KEY, facePlacements:[]},
    selectedFaceNo:UNSELECTED
  };
}

const revisionManager:RevisionManager<Revision> = new RevisionManager<Revision>(createDefaultRevision(), onPersistRevision);

export function duplicateCurrentRevisionLocation():Location {
  const location = {...revisionManager.currentRevision.location};
  location.facePlacements = [...location.facePlacements];
  return location;
}

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