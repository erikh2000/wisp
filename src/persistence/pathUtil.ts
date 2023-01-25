export function keyToPath(key:string):string {
  const pathEnd = key.lastIndexOf('/') + 1;
  return key.substring(0, pathEnd);
}

export function keyToName(key:string):string {
  const pathEnd = key.lastIndexOf('/') + 1;
  return key.substring(pathEnd);
}

export function isValidName(name:string):boolean {
  return name.indexOf('/') === -1;
}

export function fillTemplate(template:string, variables:any):string {
  let filled = template;
  const variableNames = Object.keys(variables);
  variableNames.forEach(variableName => {
    const variableValue = variables[variableName];
    filled = filled.replaceAll('{' + variableName + '}', variableValue);
  });
  return filled;
}