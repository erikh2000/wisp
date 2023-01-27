const DEBOUNCE_PERSIST_INTERVAL = 500;

export interface IPersistRevisionCallback<T> {
  (revision:T):Promise<void>
}

class RevisionPersister<T> {
  private _onPersistRevision:IPersistRevisionCallback<T>;
  private _revision:T|null
  private _debounceTimer:NodeJS.Timeout|null;
  private _lastPersistPromise:Promise<void>|null;
  
  constructor(onPersistRevision:IPersistRevisionCallback<T>) {
    this._onPersistRevision = onPersistRevision;
    this._revision = null;
    this._debounceTimer = null;
    this._lastPersistPromise = null;
  }
  
  async waitForCompletion():Promise<void> {
    if (!this._lastPersistPromise) return;
    return await this._lastPersistPromise;
  }
  
  persist(revision:T) {
    this._revision = revision;
    if (this._debounceTimer) clearTimeout(this._debounceTimer); // Prevent previous revision from being persisted since this one is newer.
    this._debounceTimer = setTimeout(() => {
      this.waitForCompletion().then(() => {
        const callback:any = this._onPersistRevision; // Cast to any because I can't get TSC to be happy with the function signature containing a generic.
        this._lastPersistPromise = callback(revision);
      });
    }, DEBOUNCE_PERSIST_INTERVAL);
  }
}

export default RevisionPersister;