import Screen, {screenConfigs} from "ui/screen/screens";

import {NavigateFunction} from "react-router";
import {theAudioContext} from 'sl-web-audio';

export function navigateToHomeIfMissingAudioContext(navigate:NavigateFunction):boolean {
  if (theAudioContext()) return false;
  navigate(screenConfigs[Screen.HOME].url);
  return true;
}