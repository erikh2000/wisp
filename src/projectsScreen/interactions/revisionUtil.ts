import RevisionManager from "documents/RevisionManager";
import {UNSPECIFIED_NAME, updateActiveProject} from "persistence/projects";

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