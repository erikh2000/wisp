import FacesScreenSettings from "facesScreen/FacesScreenSettings";
import SpielsScreenSettings from "spielsScreen/SpielsScreenSettings";

import { stringify, parse } from 'yaml';
import {FACES_SCREEN_SETTINGS_KEY, SPIELS_SCREEN_SETTINGS_KEY} from "./keyPaths";
import {getText, setText} from "./pathStore";
import {MIMETYPE_WISP_SETTING} from "./mimeTypes";

export async function getFacesScreenSettings():Promise<FacesScreenSettings|null> {
  const text = await getText(FACES_SCREEN_SETTINGS_KEY);
  return text ? parse(text) : null;
}

export async function setFacesScreenSettings(settings:FacesScreenSettings):Promise<void> {
  const text = stringify(settings);
  await setText(FACES_SCREEN_SETTINGS_KEY, text, MIMETYPE_WISP_SETTING);
}

export async function getSpielsScreenSettings():Promise<SpielsScreenSettings|null> {
  const text = await getText(SPIELS_SCREEN_SETTINGS_KEY);
  return text ? parse(text) : null;
}

export async function setSpielsScreenSettings(settings:SpielsScreenSettings):Promise<void> {
  const text = stringify(settings);
  await setText(SPIELS_SCREEN_SETTINGS_KEY, text, MIMETYPE_WISP_SETTING);
}