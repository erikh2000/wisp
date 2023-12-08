import RevisionManager from "documents/RevisionManager";
import {UNSPECIFIED_NAME, updateActiveProject} from "persistence/projects";
import {performDisablingOperation} from "projectsScreen/interactions/coreUtil";

import {DEFAULT_LANGUAGE_CODE} from "sl-web-speech";

export type Revision = {
  title:string,
  aboutText:string,
  creditsText:string,
  entrySpiel:string,
  languageCode:string
}

async function onPersistRevision(revision:Revision):Promise<void> {
  const {aboutText, creditsText, entrySpiel, languageCode} = revision;
  await updateActiveProject({aboutText, creditsText, entrySpiel, language:languageCode});
}

export function createDefaultRevision():Revision {
  return {
    title: '',
    aboutText: '',
    creditsText: '',
    entrySpiel: UNSPECIFIED_NAME,
    languageCode: DEFAULT_LANGUAGE_CODE
  };
}

const revisionManager:RevisionManager<Revision> = new RevisionManager<Revision>(createDefaultRevision(), onPersistRevision);

export function getRevisionManager() { return revisionManager; }

export function getRevisionForMount():Revision {
  return revisionManager.currentRevision;
}

export async function onUndo(setRevision:Function) {
  await performDisablingOperation(() => {
    const _revisionManager = getRevisionManager();
    _revisionManager.prev();
    setRevision(_revisionManager.currentRevision);
  });
}

export async function onRedo(setRevision:Function) {
  await performDisablingOperation(() => {
    const _revisionManager = getRevisionManager();
    _revisionManager.next();
    setRevision(_revisionManager.currentRevision);
  });
}

export function updateUndoRedoDisabled(disabled:boolean, setUndoDisabled:Function, setRedoDisabled:Function) {
  if (!revisionManager) disabled = true;
  setUndoDisabled(disabled || !revisionManager?.hasPrev);
  setRedoDisabled(disabled || !revisionManager?.hasNext);
}