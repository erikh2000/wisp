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

const revisionManager:RevisionManager<Revision> = new RevisionManager<Revision>(onPersistRevision);

export function createDefaultRevision():Revision {
  return {
    aboutText: '',
    creditsText: '',
    entrySpiel: UNSPECIFIED_NAME
  };
}

export function getRevisionManager() { return revisionManager; }

export function getRevisionForMount():Revision {
  const revision = revisionManager.currentRevision;
  if (revision) return revision;
  const newRevision = createDefaultRevision();
  revisionManager.add(newRevision);
  return newRevision;
}