import RevisionManager from "documents/RevisionManager";

export type Revision = { }

async function onPersistRevision(revision:Revision):Promise<void> {
  // TODO
}

const revisionManager:RevisionManager<Revision> = new RevisionManager<Revision>(onPersistRevision);

export function getRevisionManager() { return revisionManager; }

export function getRevisionForMount():Revision {
  const revision = revisionManager.currentRevision;
  if (revision) return revision;
  const newRevision = { };
  revisionManager.add(newRevision);
  return newRevision;
}