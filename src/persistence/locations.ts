import {storeImageAtPath} from "./imageUtil";
import {
  LOCATION_IMAGES_PATH_TEMPLATE,
  LOCATION_KEY_TEMPLATE,
  LOCATIONS_PATH_TEMPLATE
} from "./keyPaths";
import {MIMETYPE_WISP_LOCATION} from "./mimeTypes";
import {
  deleteAllKeysAtPathExcept, deleteByKey,
  getAllKeysAtPath,
  getAllValuesAtPath,
  getBytes,
  getText,
  KeyValueRecord, 
  renameKey,
  setText
} from "./pathStore";
import {fillTemplate, keyToName} from "./pathUtil";
import {getActiveProjectName, renameLocationReferencesInProject} from "./projects";
import Location from "./types/Location";

import {parse, stringify} from "yaml";

export async function getAllLocationRecords(projectName:string = getActiveProjectName()):Promise<KeyValueRecord[]> {
  const locationsPath = fillTemplate(LOCATIONS_PATH_TEMPLATE, {projectName});
  return await getAllValuesAtPath(locationsPath);
}

export async function getLocationCount(projectName:string = getActiveProjectName()):Promise<number> {
  const locationsPath = fillTemplate(LOCATIONS_PATH_TEMPLATE, {projectName});
  const keys = await getAllKeysAtPath(locationsPath);
  return keys.length;
}

export async function setLocationImage(imageFilename:string, imageBytes:Uint8Array, projectName:string = getActiveProjectName()):Promise<string> {
  const path = fillTemplate(LOCATION_IMAGES_PATH_TEMPLATE, {projectName});
  return await storeImageAtPath(path, imageFilename, imageBytes); // Returns key to stored image.
}

export async function getLocationImage(key:string):Promise<Uint8Array|null> {
  return await getBytes(key);
}

export async function getLocation(locationName:string, projectName:string = getActiveProjectName()):Promise<Location|null> {
  const key = fillTemplate(LOCATION_KEY_TEMPLATE, {projectName, locationName});
  const locationYaml = await getText(key);
  if (!locationYaml) return null;
  return parse(locationYaml);
}

export async function setLocation(locationName:string, location:Location, projectName:string = getActiveProjectName()):Promise<void> {
  const key = fillTemplate(LOCATION_KEY_TEMPLATE, {projectName, locationName});
  const locationYaml = stringify(location);
  await setText(key, locationYaml, MIMETYPE_WISP_LOCATION);
}

export async function getLocationNames(projectName:string = getActiveProjectName()):Promise<string[]> {
  const locationsPath = fillTemplate(LOCATIONS_PATH_TEMPLATE, {projectName})
  const keys = await getAllKeysAtPath(locationsPath);
  return keys.map(key => keyToName(key));
}

export async function getAllLocationKeys(projectName:string = getActiveProjectName()):Promise<string[]> {
  const locationsPath = fillTemplate(LOCATIONS_PATH_TEMPLATE, {projectName})
  return await getAllKeysAtPath(locationsPath);
}

export async function deleteUnusedLocationImages(projectName:string = getActiveProjectName()) {
  const locationKeys = await getAllLocationKeys(projectName);
  const usedImageKeys:string[] = [];
  for(let locationKeyI = 0; locationKeyI < locationKeys.length; ++locationKeyI) {
    const locationKey = locationKeys[locationKeyI];
    const location = await getLocation(keyToName(locationKey), projectName);
    if (!location) throw Error('Unexpected');
    const backgroundImageKey = location.backgroundImageKey;
    if (backgroundImageKey && !locationKeys.includes(backgroundImageKey)) usedImageKeys.push(backgroundImageKey);
  }
  
  const locationImagesPath = fillTemplate(LOCATION_IMAGES_PATH_TEMPLATE, {projectName})
  await deleteAllKeysAtPathExcept(locationImagesPath, usedImageKeys);
}

export async function renameLocation(currentLocationName:string, nextLocationName:string, projectName:string = getActiveProjectName()):Promise<void> {
  const currentKey = fillTemplate(LOCATION_KEY_TEMPLATE, {projectName, locationName:currentLocationName});
  const nextKey = fillTemplate(LOCATION_KEY_TEMPLATE, {projectName, locationName:nextLocationName});
  await renameKey(currentKey, nextKey);
  await renameLocationReferencesInProject(currentLocationName, nextLocationName, projectName);
}

export async function deleteLocation(locationName:string, projectName:string = getActiveProjectName()):Promise<void> {
  const key = fillTemplate(LOCATION_KEY_TEMPLATE, {projectName, locationName});
  await deleteByKey(key);
}