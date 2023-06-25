import {createOffScreenContext} from "common/canvasUtil";
import {duplicateCurrentRevisionLocation, getRevisionManager} from "./revisionUtil";
import {errorToast} from "ui/toasts/toastUtil";
import {getLocationImage, setLocationImage} from "persistence/locations";
import {MIMETYPE_PNG, MIMETYPE_JPEG, MIMETYPE_GIF} from "persistence/mimeTypes";
import {UNSPECIFIED_NAME} from "persistence/projects";

import {imageBitmapToPngBytes, pngBytesToImageBitmap} from 'sl-web-face';
import {splitFilenameAndExtension} from "../../persistence/pathUtil";

async function _selectImageFileHandle():Promise<FileSystemFileHandle|null> {
  const openFileOptions = {
    excludeAcceptAllOption: true,
    multiple:false,
    types: [{
      description: 'images',
      accept: {
        [MIMETYPE_PNG]: ['.png'],
        [MIMETYPE_JPEG]: ['.jpeg','.jpg'],
        [MIMETYPE_GIF]: ['.gif']
      }
    }]
  };
  try {
    const handles:FileSystemFileHandle[] = await ((window as any).showOpenFilePicker(openFileOptions));
    return handles[0];
  } catch(_ignoredAbortError) {
    return null;
  }
}

async function _getPngImageBytes(imageBuffer:ArrayBuffer, imageBitmap:ImageBitmap, mimeType:string):Promise<Uint8Array> {
  const imageBytes = new Uint8Array(imageBuffer);
  if (mimeType === MIMETYPE_PNG) return imageBytes;
  const preRenderContext = createOffScreenContext(imageBitmap.width, imageBitmap.height);
  return imageBitmapToPngBytes(imageBitmap, preRenderContext);
}

export async function onImportImage(onChoose:Function) {
  const fileHandle = await _selectImageFileHandle();
  if (fileHandle) {
    try {
      const file = await fileHandle.getFile();
      const filename = file.name;
      const mimeType = file.type;
      const buffer = await file.arrayBuffer();
      const blob = new Blob([buffer], {type: mimeType});
      const imageBitmap = await createImageBitmap(blob);
      const imageBytes = await _getPngImageBytes(buffer, imageBitmap, mimeType);
      const backgroundImageKey = await setLocationImage(filename, imageBytes);
      onChoose(imageBitmap, backgroundImageKey);
    } catch(e) {
      console.error(e);
      errorToast('Failed to load image.');
    }
  }
}

export function onChooseBackground(backgroundImage:ImageBitmap, backgroundImageKey:string, setBackgroundImage:Function, setModalDialog:Function, setRevision:Function) {
  const revisionManager = getRevisionManager();
  if (revisionManager.currentRevision.location.backgroundImageKey === backgroundImageKey) { // Possible for user to pick the same image as I already have.
    setModalDialog(null);
    return;
  }
  
  const location = duplicateCurrentRevisionLocation();
  location.backgroundImageKey = backgroundImageKey;
  revisionManager.addChanges({location});
  setRevision(revisionManager.currentRevision);
  setBackgroundImage(backgroundImage);
  setModalDialog(null);
}

export async function getBackgroundImageBitmap(backgroundImageKey:string):Promise<ImageBitmap|null> {
  if (backgroundImageKey === UNSPECIFIED_NAME) return null;
  const imageBytes = await getLocationImage(backgroundImageKey);
  return imageBytes ? await pngBytesToImageBitmap(imageBytes) : null;
}