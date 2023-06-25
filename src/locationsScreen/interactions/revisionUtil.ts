import {performDisablingOperation} from "./coreUtil";
import RevisionManager from "documents/RevisionManager";
import {UNSPECIFIED_IMAGE_KEY} from "persistence/imageUtil";
import {setLocation} from "persistence/locations";
import {getActiveLocationName} from "persistence/projects";
import Location from "persistence/types/Location";
import {getBackgroundImageBitmap} from "./backgroundImageInteractions";

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

async function _changeBackgroundImageAsNeeded(previousBackgroundImageKey:string, setBackgroundImage:Function) {
  const currentBackgroundImageKey = revisionManager.currentRevision.location.backgroundImageKey;
  if (currentBackgroundImageKey !== previousBackgroundImageKey) {
    const backgroundImage = await getBackgroundImageBitmap(currentBackgroundImageKey);
    setBackgroundImage(backgroundImage);
  }
}

export async function onUndo(setRevision:Function, setBackgroundImage:Function) {
  await performDisablingOperation(async () => {
    const currentBackgroundImageKey = revisionManager.currentRevision.location.backgroundImageKey;
    revisionManager.prev();
    setRevision(revisionManager.currentRevision);
    await _changeBackgroundImageAsNeeded(currentBackgroundImageKey, setBackgroundImage);
  });
}

export async function onRedo(setRevision:Function, setBackgroundImage:Function) {
  await performDisablingOperation(async () => {
    const currentBackgroundImageKey = revisionManager.currentRevision.location.backgroundImageKey;
    revisionManager.next();
    setRevision(revisionManager.currentRevision);
    await _changeBackgroundImageAsNeeded(currentBackgroundImageKey, setBackgroundImage);
  });
}

export function updateUndoRedoDisabled(disabled:boolean, setUndoDisabled:Function, setRedoDisabled:Function) {
  if (!revisionManager) disabled = true;
  setUndoDisabled(disabled || !revisionManager?.hasPrev);
  setRedoDisabled(disabled || !revisionManager?.hasNext);
}