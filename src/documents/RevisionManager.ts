class RevisionManager<T> {
  private revisions:T[];
  private currentRevisonNo:number;
  
  constructor() {
    this.currentRevisonNo = -1;
    this.revisions = [];
  }

  clear() {
    this.currentRevisonNo = -1;
    this.revisions = [];
  }
  
  add(revision:T) {
    const removeFromNo = this.currentRevisonNo + 1;
    if (removeFromNo < this.revisions.length) this.revisions = this.revisions.slice(0, removeFromNo);
    this.revisions.push(revision);
    ++this.currentRevisonNo;
  }
  
  addChanges(changes:any) {
    if (!this.revisions.length) throw Error('Can only add changes after one revision is stored.');
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
      console.warn('Changes pass to addChanges() all matched current state. No revision added.');
      return;
    }
    this.add(nextRevision);
  }
  
  prev():T|null {
    if (this.currentRevisonNo <= 0) return null;
    --this.currentRevisonNo;
    return this.revisions[this.currentRevisonNo]
  }
  
  next():T|null {
    if (this.currentRevisonNo >= this.revisions.length - 1) return null;
    ++this.currentRevisonNo;
    return this.revisions[this.currentRevisonNo];
  }
  
  get currentRevision():T|null {
    return this.revisions.length === 0 
      ? null : this.revisions[this.currentRevisonNo];
  }
}

export default RevisionManager;