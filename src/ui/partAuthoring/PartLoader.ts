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

class PartLoader {
  heads:LoadablePart[];
  eyes:LoadablePart[];
  mouths:LoadablePart[];
  noses:LoadablePart[];
  extras:LoadablePart[];
  private _onUpdate?:UpdateCallback;
  
  constructor(onUpdate?:UpdateCallback) {
    this.heads = this.eyes = this.mouths = this.noses = this.extras = [];
    this._onUpdate = onUpdate;
  }
  
  async loadManifest(partManifestUrl:string):Promise<PartManifest> {
    const manifest = await _loadManifest(partManifestUrl);
    this.heads = _initLoadableParts(manifest.head);
    this.eyes = _initLoadableParts(manifest.eyes);
    this.mouths = _initLoadableParts(manifest.mouth);
    this.noses = _initLoadableParts(manifest.nose);
    this.extras = _initLoadableParts(manifest.extra);
    
    // Thumbnails can continue loading after this function is resolved. Caller can use update callback to
    // learn when new thumbnails are loaded.
    const thumbnailContext = createOffScreenContext(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
    _loadParts(this.heads, thumbnailContext, HEAD_PART_TYPE, this._onUpdate);
    _loadParts(this.eyes, thumbnailContext, EYES_PART_TYPE, this._onUpdate);
    _loadParts(this.mouths, thumbnailContext, MOUTH_PART_TYPE, this._onUpdate);
    _loadParts(this.noses, thumbnailContext, NOSE_PART_TYPE, this._onUpdate);
    _loadParts(this.extras, thumbnailContext, EXTRA_PART_TYPE, this._onUpdate);
    
    return manifest;
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