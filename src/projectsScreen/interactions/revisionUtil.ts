import RevisionManager from "documents/RevisionManager";
import {UNSPECIFIED_NAME, updateActiveProject} from "persistence/projects";
import {performDisablingOperation} from "../../spielsScreen/interactions/coreUtil";

export type Revision = {
  aboutText:string,
  creditsText:string,
  entrySpiel:string
}

async function onPersistRevision(revision:Revision):Promise<void> {
  const {aboutText, creditsText, entrySpiel} = revision;
  await updateActiveProject({aboutText, creditsText, entrySpiel});
}

export function createDefaultRevision():Revision {
  return {
    aboutText: '',
    creditsText: '',
    entrySpiel: UNSPECIFIED_NAME
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