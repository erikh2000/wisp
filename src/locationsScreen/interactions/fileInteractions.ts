import {getBackgroundImageBitmap} from "./backgroundImageInteractions";
import {createDefaultRevision, getRevisionManager, Revision, UNSELECTED} from "./revisionUtil";
import {deleteLocation, getLocation, renameLocation} from "persistence/locations";
import {setActiveLocationName, UNSPECIFIED_NAME} from "persistence/projects";
import Screen, {screenConfigs} from "ui/screen/screens";

import {NavigateFunction} from "react-router";

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

export async function onRenameLocation(currentLocationName:string, nextLocationName:string, setDocumentName:Function, setModalDialog:Function) {
  await renameLocation(currentLocationName, nextLocationName);
  await setActiveLocationName(nextLocationName);
  setDocumentName(nextLocationName);
  setModalDialog(null);
}

export async function onConfirmDeleteLocation(locationName:string, navigate:NavigateFunction) {
  try {
    await deleteLocation(locationName);
    await setActiveLocationName(UNSPECIFIED_NAME);
    const revisionManager = getRevisionManager();
    revisionManager.clear();
  } finally {
    navigate(screenConfigs[Screen.HOME].url);
  }
}