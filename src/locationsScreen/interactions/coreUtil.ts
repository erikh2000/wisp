import PartUiManager from "ui/partAuthoring/PartUiManager";

let setDisabled:Function|null = null;
let partUiManager:PartUiManager|null = null;

export function bindSetDisabled(_setDisabled:Function) {
  setDisabled = _setDisabled;
}

export function initCore(_setDisabled:Function, _partUiManager:PartUiManager) {
  partUiManager = _partUiManager;
  bindSetDisabled(_setDisabled);
}

export function getPartUiManager():PartUiManager {
  if (!partUiManager) throw Error('Unexpected');
  return partUiManager;
}

export async function performDisablingOperation(taskFunction:Function):Promise<any> {
  if (!setDisabled) throw Error('Unexpected');
  setDisabled(true);
  let result:any = undefined;
  try {
    result = await taskFunction();
  } finally {
    setDisabled(false);
  }
  return result;
}