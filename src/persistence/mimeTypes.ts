export const MIMETYPE_AUDIO_WAV = 'audio/wav';
export const MIMETYPE_FOUNTAIN = 'text/vnd.fountain'; // I don't actually know the "official" MIME type of Fountain. Please holler at me if you do.
export const MIMETYPE_GIF = 'image/gif';
export const MIMETYPE_JPEG = 'image/jpeg';
export const MIMETYPE_OCTET_STREAM = 'application/octet-stream';
export const MIMETYPE_PLAIN_TEXT = 'text/plain';
export const MIMETYPE_PNG = 'image/png';
export const MIMETYPE_WISP_FACE = 'application/vnd.seespacelabs.wisp.face';
export const MIMETYPE_WISP_LOCATION = 'application/vnd.seespacelabs.wisp.location';
export const MIMETYPE_WISP_PROJECT = 'application/vnd.seespacelabs.wisp.project';
export const MIMETYPE_WISP_SETTING = 'application/vnd.seespacelabs.wisp.setting';
export const MIMETYPE_WISP_SPIEL = 'application/vnd.seespacelabs.wisp.spiel';

type MimeTypeToExtensionMap = {
  [key:string]:string
}

const MIMETYPE_TO_EXTENSION_MAP:MimeTypeToExtensionMap = {
  [MIMETYPE_AUDIO_WAV]: 'wav',
  [MIMETYPE_FOUNTAIN]: 'fountain',
  [MIMETYPE_GIF]: 'gif',
  [MIMETYPE_JPEG]: 'jpg',
  [MIMETYPE_OCTET_STREAM]: 'bin',
  [MIMETYPE_PLAIN_TEXT]: 'txt',
  [MIMETYPE_PNG]: 'png',
  [MIMETYPE_WISP_FACE]: 'face',
  [MIMETYPE_WISP_LOCATION]: 'location',
  [MIMETYPE_WISP_PROJECT]: 'wisp',
  [MIMETYPE_WISP_SETTING]: 'settings',
  [MIMETYPE_WISP_SPIEL]: 'spiel'
};


const DEFAULT_EXTENSION = '';

export function mimeTypeToExtension(mimeType:string):string {
  return MIMETYPE_TO_EXTENSION_MAP[mimeType] ?? DEFAULT_EXTENSION;
}

// Code for extensionToMimeType() deleted on 6/25/23. See commits if you want it back.
