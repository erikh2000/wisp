import {createDefaultRevision, getRevisionManager, Revision, UNSELECTED} from "./revisionUtil";
import {setActiveLocationName} from "persistence/projects";
import {getLocation} from "persistence/locations";
import {getBackgroundImageBitmap} from "./backgroundImageInteractions";

export async function onNewLocation(locationName:string, setDocumentName:Function, setBackgroundImage:Function, setModalDialog:Function, setRevision:Function) {
  await setActiveLocationName(locationName);
  setDocumentName(locationName);
  const revisionManager = getRevisionManager();
  const defaultRevision = createDefaultRevision();
  revisionManager.clear(defaultRevision);
  setBackgroundImage(null);
  setRevision(defaultRevision);
  setModalDialog(null);
}

export async function onOpenLocation(locationName:string, setDocumentName:Function, setBackgroundImage:Function, setModalDialog:Function, setRevision:Function) {
  const location = await getLocation(locationName);
  if (!location) throw Error('Unexpected');
  const backgroundImage = await getBackgroundImageBitmap(location.backgroundImageKey);
  await setActiveLocationName(locationName);
  setDocumentName(locationName);
  const revisionManager = getRevisionManager();
  const nextRevision:Revision = {
    location,
    selectedFaceNo: location.facePlacements.length ? 0 : UNSELECTED
  }
  revisionManager.clear(nextRevision);
  setBackgroundImage(backgroundImage);
  setRevision(nextRevision);
  setModalDialog(null);
}