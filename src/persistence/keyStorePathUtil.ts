export function pathFromKey(key:string):string {
  const pathEnd = key.lastIndexOf('/') + 1;
  return key.substring(0, pathEnd);
}

export function nameFromKey(key:string):string {
  const pathEnd = key.lastIndexOf('/') + 1;
  return key.substring(pathEnd);
}