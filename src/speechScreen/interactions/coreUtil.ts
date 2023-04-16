let setDisabled:Function|null = null; 
export function bindSetDisabled(_setDisabled:any) {
  setDisabled = _setDisabled;
}

export function initCore(_setDisabled:any) {
  bindSetDisabled(_setDisabled);
}

export async function performDisablingOperation(taskFunction:any):Promise<any> {
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