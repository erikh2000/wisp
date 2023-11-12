import { parse } from 'yaml';

export async function fetchText(url:string):Promise<string> {
  const request = await fetch(url);
  if (request.status !== 200 && request.status !== 304) throw Error(`Failed to fetch from "${url}", status code=${request.status}`);
  return await request.text();
}

export async function fetchYaml(url:string):Promise<any> {
  const yaml = await fetchText(url);
  return parse(yaml);  
}

function _changePathStartAsNeeded(path:string, start:string):string {
  if (!start.length || path.startsWith(start)) return path;
  if (start.endsWith('/')) start = start.substring(0, start.length - 1);
  if (path.startsWith('/')) path = path.substring(1);
  return `${start}/${path}`;
}

export function makePublicUrl(path:string):string {
  return _changePathStartAsNeeded(path, process.env.PUBLIC_URL ?? '');
}

export function makeSharedUrl(url:string):string {
  return _changePathStartAsNeeded(url, 'https://shared.wisp.studio');
}