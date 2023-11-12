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

export function makePublicUrl(url:string):string {
  let publicUrl = `${process.env.PUBLIC_URL}` ?? '';
  if (!publicUrl.length || url.startsWith(publicUrl)) return url;
  if (publicUrl.endsWith('/')) publicUrl = publicUrl.substring(0, publicUrl.length - 1);
  if (url.startsWith('/')) url = url.substring(1);
  return `${publicUrl}/${url}`;
}