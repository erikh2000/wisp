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