let setDisabled:Function|null = null; 
export function bindSetDisabled(_setDisabled:any) {
  setDisabled = _setDisabled;
}

export function initCore(_setDisabled:any) {
  bindSetDisabled(_setDisabled);
}