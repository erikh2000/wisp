import {createDefaultRevision, getRevisionManager} from "./revisionUtil";
import {setActiveLocationName} from "persistence/projects";

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