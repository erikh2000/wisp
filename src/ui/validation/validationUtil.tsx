export type NormalizedNameMap = {
  [name:string]:string
};

function _normalizeNameForUniquenessCheck(name:string) {
  return name.toLowerCase().trim();  
} 

export function createNormalizedNameMap(names:string[]):NormalizedNameMap {
  const map:NormalizedNameMap = {};
  names.forEach(name => {
    const normalized = _normalizeNameForUniquenessCheck(name);
    map[normalized] = name;
  });
  return map;
}

export function findUniqueDefaultValue(existingValues:NormalizedNameMap, firstValue:string):string {
  function _isUnique(value:string):boolean {
    const normalized = _normalizeNameForUniquenessCheck(value);
    return existingValues[normalized] === undefined;
  }
  
  if (_isUnique(firstValue)) return firstValue;
  for(let i = 2; i < 10000; ++i) {
    const candidateValue = `${firstValue} ${i}`;
    if (_isUnique(candidateValue)) return candidateValue;
  }
  
  throw Error('Unexpected'); // I can't see a user creating that many files with the same default name pattern.
}

export function fixPathStoreName(name:string):string|null {
  let fixed = name.replaceAll('/', '');
  return fixed === name ? null : fixed;
}

export function validatePathStoreNameForSubmit(name:string, existingNames:NormalizedNameMap):string[]|null {
  const failReasons:string[] = [];
  
  const normalized = _normalizeNameForUniquenessCheck(name);
  if (existingNames[normalized]) failReasons.push('Name must be unique.');
  if (normalized.length === 0) failReasons.push('Name must be specified.');
  if (name.indexOf('/') !== -1) failReasons.push('Name may not contain "/" characters.');
  
  return failReasons.length ? failReasons : null;
}