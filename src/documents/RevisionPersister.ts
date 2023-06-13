import {disableAwayNavigation, enableAwayNavigation} from "common/awayNavigationUtil";

const DEBOUNCE_PERSIST_INTERVAL = 500;

export interface IPersistRevisionCallback<T> {
  (revision:T):Promise<void>
}

class RevisionPersister<T> {
  private _onPersistRevision:IPersistRevisionCallback<T>;
  private _revision:T|null
  private _debounceTimer:NodeJS.Timeout|null;
  
  constructor(onPersistRevision:IPersistRevisionCallback<T>) {
    this._onPersistRevision = onPersistRevision;
    this._revision = null;
    this._debounceTimer = null;
  }
  
  private _abort() {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }
  }
  
  private async _persist(revision:T):Promise<void> {
    this._abort(); // Prevent previous revision from being persisted since this one is newer.
    const callback:any = this._onPersistRevision; // Cast to any because I can't get TSC to be happy with the function signature containing a generic.
    return callback(revision);
  }
  
  persist(revision:T) {
    disableAwayNavigation();
    this._abort(); // Prevent previous revision from being persisted since this one is newer.
    this._debounceTimer = setTimeout(() => {
      this._persist(revision)
        .then(() => enableAwayNavigation())
        .catch((e) => {
          console.error(e);
          enableAwayNavigation();
        });
    }, DEBOUNCE_PERSIST_INTERVAL);
  }
  
  async persistNow(revision:T):Promise<void> {
    this._abort(); // Prevent previous revision from being persisted since this one is newer.
    disableAwayNavigation();
    try {
      await this._persist(revision);
    } catch (e) {
      console.error(e);
    }
    enableAwayNavigation();
  }
}

export default RevisionPersister;