import {setActiveSpielName, UNSPECIFIED_NAME} from "persistence/projects";
import {MIMETYPE_WISP_SPIEL, MIMETYPE_FOUNTAIN} from "persistence/mimeTypes";
import NewSpielDialog from "spielsScreen/fileDialogs/NewSpielDialog";
import {performDisablingOperation} from "spielsScreen/interactions/coreUtil";
import {setUpRevisionForNewSpiel, getRevisionManager} from "spielsScreen/interactions/revisionUtil";

import {importFountain, exportSpielFile, Spiel} from 'sl-spiel';
import {renameSpiel} from "../../persistence/spiels";

export function onNewSpielName(spielName:string, setModalDialog:Function, setDocumentName:Function) {
  setActiveSpielName(spielName).then(() => {
    const revisionManager = getRevisionManager();
    return revisionManager.persistCurrent();
  }).then(() => {
    setDocumentName(spielName);
    setModalDialog(null);
  });
}

export function onRenameSpiel(documentName:string, spielName:string, setModalDialog:Function, setDocumentName:Function) {
  renameSpiel(documentName, spielName).then(() => {
    setDocumentName(spielName);
    setModalDialog(null);
  });
}

async function _selectSpielFileHandle():Promise<FileSystemFileHandle|null> {
  const openFileOptions = {
    excludeAcceptAllOption: true,
    multiple:false,
    types: [{
      description: 'Spiel (.spiel)',
      accept: {[MIMETYPE_WISP_SPIEL]: ['.spiel']}
    },
    {
      description: 'Fountain Script (.fountain, .spmd, .text)',
      accept: {[MIMETYPE_FOUNTAIN]: ['.fountain', '.txt', '.spmd']}
    }]
  };
  try {
    const handles:FileSystemFileHandle[] = await ((window as any).showOpenFilePicker(openFileOptions));
    return handles[0];
  } catch(_ignoredAbortError) {
    return null;
  }
}

export async function _selectNewSpielFileHandle(suggestedFilename:string):Promise<FileSystemFileHandle|null> {
  try {
    const saveFileOptions = {
      suggestedName:suggestedFilename,
      excludeAcceptAllOption: true,
      multiple:false,
      types: [{
        description: 'Spiel (.spiel)',
        accept: {[MIMETYPE_WISP_SPIEL]: ['.spiel']}
      }]
    };
    return await (window as any).showSaveFilePicker(saveFileOptions);
  } catch(_ignoredAbortError) {
    return null;
  }
}

async function _loadSpielTextFromFileHandle(fileHandle:FileSystemFileHandle):Promise<string> {
  const isFountainFile = !fileHandle.name.endsWith('.spiel');
  const file = await fileHandle.getFile();
  const text = await file.text();
  if (!isFountainFile) return text;
  const spiel = importFountain(text);
  return exportSpielFile(spiel);
}

async function _setUpForNewSpiel(loadSpielTextFunc:() => Promise<string>, setDocumentName:any, setRevision:any):Promise<void> {
  await performDisablingOperation(async () => {
    setDocumentName(UNSPECIFIED_NAME); // If anything fails, it's better to leave the document name cleared to avoid overwriting a previous face.
    await setActiveSpielName(UNSPECIFIED_NAME);
    const revisionManager = getRevisionManager();
    await revisionManager.waitForPersist();
    const spielText = await loadSpielTextFunc();
    await setUpRevisionForNewSpiel(spielText, setRevision);
  });
}

export async function importSpiel(setModalDialog:Function, setDocumentName:Function, setRevision:Function):Promise<void> {
  await performDisablingOperation(async () => {
    const spielFileHandle = await _selectSpielFileHandle();
    if (!spielFileHandle) return;
    await _setUpForNewSpiel(() => _loadSpielTextFromFileHandle(spielFileHandle), setDocumentName, setRevision);
    setModalDialog(NewSpielDialog.name);
  });
}

export async function exportSpiel(documentName:string):Promise<void> {
  await performDisablingOperation(async () => {
    let fileHandle = await _selectNewSpielFileHandle(documentName);
    if (!fileHandle) return;
    const revisionManager = getRevisionManager();
    await revisionManager.waitForPersist();
    const spiel = revisionManager.currentRevision?.spiel ?? new Spiel();
    const spielText = exportSpielFile(spiel);
    const writable = await (fileHandle as any).createWritable();
    await writable.write(spielText);
    return await writable.close();
  });
}