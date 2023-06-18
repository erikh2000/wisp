export const MIMETYPE_OCTET_STREAM = 'application/octet-stream'
export const MIMETYPE_PLAIN_TEXT = 'text/plain';
export const MIMETYPE_WISP_FACE = 'application/vnd.seespacelabs.wisp.face';
export const MIMETYPE_WISP_PROJECT = 'application/vnd.seespacelabs.wisp.project';
export const MIMETYPE_WISP_SPIEL = 'application/vnd.seespacelabs.wisp.spiel';
export const MIMETYPE_FOUNTAIN = 'text/vnd.fountain'; // I don't actually know the "official" MIME type of Fountain. Please holler at me if you do.
export const MIMETYPE_AUDIO_WAV = 'audio/wav';
export const MIMETYPE_PNG = 'image/png';
export const MIMETYPE_JPEG = 'image/jpeg';
export const MIMETYPE_GIF = 'image/gif';

export const MIMETYPE_WISP_SETTING = 'application/vnd.seespacelabs.wisp.setting';

type MimeTypeToExtensionMap = {
  [key:string]:string
}

const MIMETYPE_TO_EXTENSION_MAP:MimeTypeToExtensionMap = {
  [MIMETYPE_OCTET_STREAM]: 'bin',
  [MIMETYPE_PLAIN_TEXT]: 'txt',
  [MIMETYPE_WISP_FACE]: 'face',
  [MIMETYPE_WISP_PROJECT]: 'wisp',
  [MIMETYPE_WISP_SPIEL]: 'spiel',
  [MIMETYPE_FOUNTAIN]: 'fountain',
  [MIMETYPE_AUDIO_WAV]: 'wav',
  [MIMETYPE_WISP_SETTING]: 'settings'
};

const DEFAULT_EXTENSION = '';

export function mimeTypeToExtension(mimeType:string):string {
  return MIMETYPE_TO_EXTENSION_MAP[mimeType] ?? DEFAULT_EXTENSION;
}