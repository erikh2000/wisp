import {getActiveFaceName} from "persistence/projects";
import {loadFaceFromName} from "facesCommon/interactions/fileInteractions";
import {initFaceEvents} from 'facesCommon/interactions/faceEventUtil';
import {initCore} from "spielsScreen/interactions/coreUtil";

export type InitResults = {
  faceName:string
};

export async function init():Promise<InitResults> {
  const faceName = await getActiveFaceName();
  const headComponent = await loadFaceFromName(faceName);
  initFaceEvents(headComponent);
  initCore(headComponent);
  return {
    faceName
  };
}