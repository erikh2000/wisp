import {MIMETYPE_PNG, MIMETYPE_JPEG, MIMETYPE_GIF} from "persistence/mimeTypes";
import {errorToast} from "ui/toasts/toastUtil";
import {getRevisionManager} from "./revisionUtil";

async function _selectImageFileHandle():Promise<FileSystemFileHandle|null> {
  const openFileOptions = {
    excludeAcceptAllOption: true,
    multiple:false,
    types: [{
      description: 'PNG',
      accept: {[MIMETYPE_PNG]: ['.png']}
    },{
      description: 'JPG',
      accept: {[MIMETYPE_JPEG]: ['.jpeg','.jpg']}
    },{
      description: 'GIF',
      accept: {[MIMETYPE_GIF]: ['.gif']}
    }]
  };
  try {
    const handles:FileSystemFileHandle[] = await ((window as any).showOpenFilePicker(openFileOptions));
    return handles[0];
  } catch(_ignoredAbortError) {
    return null;
  }
}

export async function onImportImage(onChoose:Function) {
  const fileHandle = await _selectImageFileHandle();
  if (fileHandle) {
    try {
      const file = await fileHandle.getFile();
      const buffer = await file.arrayBuffer();
      const blob = new Blob([buffer], {type: file.type});
      const imageBitmap = await createImageBitmap(blob);
      onChoose(imageBitmap);
    } catch(e) {
      console.error(e);
      errorToast('Failed to load image.');
    }
  }
}

export function onChooseBackground(backgroundImage:ImageBitmap, setModalDialog:Function, setRevision:Function) {
  const revisionManager = getRevisionManager();
  revisionManager.addChanges({backgroundImage});
  setRevision(revisionManager.currentRevision);
  setModalDialog(null);
}