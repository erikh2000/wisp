import {parse} from 'yaml';
import {
  CanvasComponent,
  EYES_PART_TYPE, 
  HEAD_PART_TYPE,
  MOUTH_PART_TYPE, 
  NOSE_PART_TYPE,
  clearContext,
  contextToImageBitmap,
  createOffScreenContext, 
  loadComponentFromPartUrl 
} from "sl-web-face";

export type LoadablePart = {
  thumbnail:ImageBitmap|null,
  url:string
}

export type UpdateCallback = (partName:string, partTypeName:string) => void;

type PartManifest = {
  head: string[];
  nose: string[];
  eyes: string[];
  mouth: string[];
  extra: string[];
}

export const THUMBNAIL_WIDTH = 100, THUMBNAIL_HEIGHT = 100;

async function _loadManifest(partManifestUrl:string):Promise<PartManifest> {
  const response = await fetch(partManifestUrl);
  if (response.status !== 200 && response.status !== 304) throw Error(`Failed to fetch part manifest - HTTP status ${response.status}.`);
  const text = await response.text();
  const object:any = parse(text);
  return object as PartManifest;
}

function _initLoadableParts(partUrls:string[]):LoadablePart[] {
  return partUrls.map(url => {
    return {url, thumbnail:null};
  });
}

function _resizeComponentToFit(width:number, height:number, component:CanvasComponent) {
  const scaleX = width / component.width;
  const scaleY = width / component.height;
  const scale = Math.min(scaleX, scaleY);
  component.width = component.width * scale;
  component.height = component.height * scale;
}

async function _loadPart(part:LoadablePart, thumbnailContext:CanvasRenderingContext2D, partTypeName:string, onUpdate?:UpdateCallback) {
  // TODO - persistent caching of thumbnails
  if (part.thumbnail) return;
  const component = await loadComponentFromPartUrl(part.url);
  _resizeComponentToFit(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, component);
  component.height = thumbnailContext.canvas.height;
  clearContext(thumbnailContext);
  const x = (THUMBNAIL_WIDTH - component.width) / 2, y = (THUMBNAIL_HEIGHT - component.height) / 2;
  component.renderAt(thumbnailContext, x, y);
  part.thumbnail = await contextToImageBitmap(thumbnailContext);
  if (onUpdate) onUpdate(partTypeName, part.url);
}

async function _loadParts(parts:LoadablePart[], thumbnailContext:CanvasRenderingContext2D, partTypeName:string, onUpdate?:UpdateCallback) {
  parts.forEach(part => _loadPart(part, thumbnailContext, partTypeName, onUpdate));
} 

const EXTRA_PART_TYPE = 'extra'; // TODO move to sl-web-face.
async function _init(partManifestUrl:string, partLoader:PartLoader, onUpdate?:UpdateCallback) {
  const manifest = await _loadManifest(partManifestUrl);
  partLoader.heads = _initLoadableParts(manifest.head);
  partLoader.eyes = _initLoadableParts(manifest.eyes);
  partLoader.mouths = _initLoadableParts(manifest.mouth);
  partLoader.noses = _initLoadableParts(manifest.nose);
  partLoader.extras = _initLoadableParts(manifest.extra);
  if (onUpdate) {
    onUpdate(HEAD_PART_TYPE, 'manifest');
    onUpdate(EYES_PART_TYPE, 'manifest');
    onUpdate(MOUTH_PART_TYPE, 'manifest');
    onUpdate(NOSE_PART_TYPE, 'manifest');
    onUpdate(EXTRA_PART_TYPE, 'manifest');
  }
  const thumbnailContext = createOffScreenContext(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
  _loadParts(partLoader.heads, thumbnailContext, HEAD_PART_TYPE, onUpdate);
  _loadParts(partLoader.eyes, thumbnailContext, EYES_PART_TYPE, onUpdate);
  _loadParts(partLoader.mouths, thumbnailContext, MOUTH_PART_TYPE, onUpdate);
  _loadParts(partLoader.noses, thumbnailContext, NOSE_PART_TYPE, onUpdate);
  _loadParts(partLoader.extras, thumbnailContext, EXTRA_PART_TYPE, onUpdate);
}

class PartLoader {
  heads:LoadablePart[];
  eyes:LoadablePart[];
  mouths:LoadablePart[];
  noses:LoadablePart[];
  extras:LoadablePart[];
  private _onUpdate?:UpdateCallback;
  
  constructor(partManifestUrl:string, onUpdate?:UpdateCallback) {
    this.heads = this.eyes = this.mouths = this.noses = this.extras = [];
    this._onUpdate = onUpdate;
    _init(partManifestUrl, this, onUpdate);
  }
  
  getPartsForType(partTypeName:string):LoadablePart[] {
    switch(partTypeName) {
      case HEAD_PART_TYPE: return this.heads;
      case EYES_PART_TYPE: return this.eyes;
      case MOUTH_PART_TYPE: return this.mouths;
      case NOSE_PART_TYPE: return this.noses;
      default: return this.extras;
    }
  }
}

export default PartLoader;