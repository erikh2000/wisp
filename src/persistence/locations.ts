import {
  LOCATION_IMAGES_PATH_TEMPLATE,
  LOCATION_KEY_TEMPLATE,
  LOCATIONS_PATH_TEMPLATE,
  SPIELS_PATH_TEMPLATE
} from "./keyPaths";
import {getAllKeysAtPath, getAllValuesAtPath, getBytes, getText, KeyValueRecord, setText} from "./pathStore";
import {fillTemplate, keyToName} from "./pathUtil";
import {getActiveProjectName} from "./projects";
import {MIMETYPE_WISP_LOCATION} from "./mimeTypes";
import {storeImageAtPath} from "./imageUtil";
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