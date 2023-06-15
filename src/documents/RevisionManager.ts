import RevisionPersister, {IPersistRevisionCallback} from "documents/RevisionPersister";

class RevisionManager<T> {
  private revisions:T[];
  private currentRevisionNo:number;
  private persister:RevisionPersister<T>;
  private initialRevision:T;
  
  constructor(initialRevision:T, onPersistRevision:IPersistRevisionCallback<T>) {
    this.currentRevisionNo = 0;
    this.initialRevision = {...initialRevision};
    this.revisions = [this.initialRevision];
    this.persister = new RevisionPersister<T>(onPersistRevision);
  }

  clear(initialRevision:T|null = null) {
    this.currentRevisionNo = 0;
    if (initialRevision) this.initialRevision = {...initialRevision};
    this.revisions = [this.initialRevision];
  }
  
  add(revision:T) {
    const removeFromNo = this.currentRevisionNo + 1;
    if (removeFromNo < this.revisions.length) this.revisions = this.revisions.slice(0, removeFromNo);
    this.revisions.push(revision);
    this.persister.persist(revision);
    ++this.currentRevisionNo;
  }
  
  // Forces persistence of current revision. Useful for when the debounced persistence won't guarantee persistence 
  // of the current revision, e.g. when the user is about to close the page.
  async persistCurrent():Promise<void> {
    return this.persister.persistNow(this.currentRevision);
  }
  
  addChanges(changes:any) {
    const nextRevision = {...this.currentRevision} as T;
    let hasChanged = false;
    Object.keys(changes).forEach(key => {
      const currentValue = (nextRevision as any)[key];
      const nextValue = changes[key];
      if (currentValue !== nextValue) {
        (nextRevision as any)[key] = nextValue;
        hasChanged = true;
      }
    });
    if (!hasChanged) {
      console.warn('Changes passed to addChanges() all matched current state. No revision added.');
      return;
    }
    this.add(nextRevision);
  }
  
  get hasPrev():boolean {
    return this.currentRevisionNo > 0;
  }
  
  prev():T|null {
    if (!this.hasPrev) return null;
    const revision = this.revisions[--this.currentRevisionNo];
    this.persister.persist(revision);
    return revision;
  }
  
  get hasNext():boolean {
    return this.currentRevisionNo < this.revisions.length - 1;
  }
  
  next():T|null {
    if (!this.hasNext) return null;
    const revision = this.revisions[++this.currentRevisionNo];
    this.persister.persist(revision);
    return revision;
  }
  
  get currentRevision():T {
    return this.revisions[this.currentRevisionNo];
  }
}

export default RevisionManager;