let setDisabled:Function|null = null;
export function bindSetDisabled(_setDisabled:Function) {
  setDisabled = _setDisabled;
}

export function initCore(_setDisabled:Function) {
  bindSetDisabled(_setDisabled);
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