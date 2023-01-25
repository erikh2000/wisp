import {keyToPath} from "./pathUtil";
import {MIMETYPE_OCTET_STREAM, MIMETYPE_PLAIN_TEXT} from "./mimeTypes";

const DB_NAME = 'wisp';
const KEY_VALUE_STORE = 'KeyValue';
const PATH_INDEX_NAME = 'pathIndex';


type IndexConfig = {
  name:string,
  keypath:string,
  options:IDBIndexParameters
}

const SCHEMA = {
  __version:1,
  [KEY_VALUE_STORE]: {
    __options:{keyPath:'key'},
    __indexes:[{name:PATH_INDEX_NAME, keypath:'path', options:{unique:false, multiEntry:false}}]
  }
};

type KeyValueRecord = {
  key:string,
  path:string,
  mimeType:string,
  lastModified:number,
  text:string|null,
  bytes:Uint8Array|null
};

function _getStoreNamesFromSchema(schema:any):string[] {
  return Object.keys(schema).filter(key => key !== '__version');
}

function _createStores(db:IDBDatabase, schema:any) {
  const storeNames = _getStoreNamesFromSchema(schema);
  storeNames.forEach(storeName => {
    const storeSchema = schema[storeName];
    const store = db.createObjectStore(storeName, storeSchema.__options);
    const indexes:IndexConfig[] = storeSchema.__indexes ?? [];
    indexes.forEach(indexConfig => {
      store.createIndex(indexConfig.name, indexConfig.keypath, indexConfig.options);
    });
  });
}

function _populateStores(_db:IDBDatabase, _schema:any) {
  // If you need this, then add something into your schema definition above that says how records will be populated.
  // For a reference implementation, see encryption-at-rest-poc database.ts.
}

async function _open(name:string, schema:any):Promise<IDBDatabase> {
  const version = schema.__version;
  let wereStoresCreated = false;
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onerror = (event:any) => reject(`Failed to open "${name}" database with error code ${event.target.errorCode}.`);
    request.onupgradeneeded = (event:any) => {
      const db = event.target.result as IDBDatabase;
      _createStores(db, schema);
      wereStoresCreated = true;
    }
    request.onsuccess = (event:any) => {
      const db = event.target.result as IDBDatabase;
      db.onerror = (event:any) => { throw Error("Database error: " + event.target.errorCode); } // Not using reject() since error could come later after this promise completes.
      if (wereStoresCreated) _populateStores(db, schema);
      resolve(db);
    }
  });
}

async function _get(db:IDBDatabase, storeName:string, key:string):Promise<object> {
  const transaction = db.transaction(storeName);
  const objectStore = transaction.objectStore(storeName);
  const request = objectStore.get(key);
  return new Promise((resolve, reject) => {
    request.onerror = (event:any) => reject(`Failed to get from "${storeName} with error code ${event.target.errorCode}.`);
    request.onsuccess = (_event:any) => resolve(request.result)
  });
}

async function _put(db:IDBDatabase, storeName:string, objectToStore:object):Promise<void> {
  const transaction = db.transaction(storeName, 'readwrite');
  const objectStore = transaction.objectStore(storeName);
  const request = objectStore.put(objectToStore);
  return new Promise((resolve, reject) => {
    request.onerror = (event:any) => reject(`Failed to put to "${storeName} with error code ${event.target.errorCode}.`);
    request.onsuccess = () => resolve()
  });
}

export async function deleteDatabase():Promise<void> {
  const request = indexedDB.deleteDatabase(DB_NAME);
  return new Promise((resolve, reject) => {
    request.onerror = (event:any) => reject(`Failed to delete "${DB_NAME}}" database with error code ${event.target.errorCode}.`);
    request.onsuccess = () => resolve();
  });
}

async function _getRecordByKey(key:string):Promise<KeyValueRecord> {
  const db = await _open(DB_NAME, SCHEMA);
  return (await _get(db, KEY_VALUE_STORE, key)) as KeyValueRecord;
}

export async function getText(key:string):Promise<string|null> {
  const record = await _getRecordByKey(key);
  return record.text;
}

export async function getBytes(key:string):Promise<Uint8Array|null> {
  const record = await _getRecordByKey(key);
  return record.bytes;
}

async function _setFieldValue(key:string, fieldName:string, fieldValue:any, mimeType:string) {
  const db = await _open(DB_NAME, SCHEMA);
  const record = await _getRecordByKey(key)
    ?? { key } as KeyValueRecord;
  (record as any)[fieldName] = fieldValue;
  record.path = keyToPath(key);
  record.mimeType = mimeType;
  record.lastModified = Date.now();
  await _put(db, KEY_VALUE_STORE, record);
}

export async function setText(key:string, text:string|null, mimeType:string = MIMETYPE_PLAIN_TEXT) {
  await _setFieldValue(key, 'text', text, mimeType);
}

export async function setBytes(key:string, bytes:Uint8Array|null, mimeType = MIMETYPE_OCTET_STREAM) {
  await _setFieldValue(key, 'bytes', bytes, mimeType);
}

export async function doesDatabaseExist():Promise<boolean> {
  const dbInfos:IDBDatabaseInfo[] = await indexedDB.databases();
  const found = dbInfos.find(dbInfo => dbInfo.name === DB_NAME);
  return found !== undefined;
}

export async function getAllKeys():Promise<string[]> {
  const db = await _open(DB_NAME, SCHEMA);
  const transaction = db.transaction(KEY_VALUE_STORE);
  const objectStore = transaction.objectStore(KEY_VALUE_STORE);
  const request = objectStore.getAllKeys();
  return new Promise((resolve, reject) => {
    request.onerror = (event:any) => reject(`Failed to get all keys with error code ${event.target.errorCode}.`);
    request.onsuccess = () => resolve(request.result as string[])
  });
}

export async function getAllKeysAtPath(path:string):Promise<string[]> {
  const db = await _open(DB_NAME, SCHEMA);
  const transaction = db.transaction(KEY_VALUE_STORE);
  const objectStore = transaction.objectStore(KEY_VALUE_STORE);
  const pathIndex = objectStore.index(PATH_INDEX_NAME);
  const request = pathIndex.getAllKeys(path);
  return new Promise((resolve, reject) => {
    request.onerror = (event:any) => reject(`Failed to get all keys from "${path}" path with error code ${event.target.errorCode}.`);
    request.onsuccess = () => resolve(request.result as string[]);
  });
}