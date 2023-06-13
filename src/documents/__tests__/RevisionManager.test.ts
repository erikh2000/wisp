import RevisionManager from "../RevisionManager";
import { wait } from "common/waitUtil";

async function doNothingPersister(_ignore:Object) { } 

describe('RevisionManager', () => {
  it('constructs', () => {
    const r = new RevisionManager<Object>({}, doNothingPersister);
    expect(r.currentRevision).toEqual({});
  });
  
  it('adds a revision', () => {
    const r = new RevisionManager<Object>({}, doNothingPersister);
    r.add({x:'hey!'});
    expect(r.currentRevision).toEqual({x:'hey!'});
  });
  
  it('adds two revisions', () => {
    const r = new RevisionManager<Object>({}, doNothingPersister);
    r.add({x:'apples'});
    r.add({x:'bananas'});
    expect(r.currentRevision).toEqual({x:'bananas'});
  });

  it('returns to previous revision', () => {
    const r = new RevisionManager<Object>({}, doNothingPersister);
    r.add({x:'apples'});
    r.add({x:'bananas'});
    expect(r.prev()).toEqual({x:'apples'});
  });

  it('returns to next revision', () => {
    const r = new RevisionManager<Object>({}, doNothingPersister);
    r.add({x:'apples'});
    r.add({x:'bananas'});
    r.prev();
    expect(r.next()).toEqual({x:'bananas'});
  });

  it('adding a revision from an earlier index will clear the later revisions', () => {
    const r = new RevisionManager<Object>({},doNothingPersister);
    r.add({x:'apples'});
    r.add({x:'bananas'});
    r.add({x:'cantaloupes'});
    r.prev();
    r.prev();
    r.add({x:'buffalo'});
    expect(r.next()).toBeNull();
  });
  
  it('currentRevision returns initial revision when no revisions added', () => {
    const r = new RevisionManager<Object>({}, doNothingPersister);
    expect(r.currentRevision).toEqual({});
  });
  
  it('prev() returns null when no revisions added', () => {
    const r = new RevisionManager<Object>({}, doNothingPersister);
    expect(r.prev()).toBeNull();
  });

  it('prev() returns null when at beginning of revisions', () => {
    const r = new RevisionManager<Object>({}, doNothingPersister);
    r.add({x:'apples'});
    expect(r.prev()).not.toBeNull();
    expect(r.prev()).toBeNull();
  });

  it('next() returns null when no revisions added', () => {
    const r = new RevisionManager<Object>({}, doNothingPersister);
    expect(r.next()).toBeNull();
  });

  it('next() returns null when at end of revisions', () => {
    const r = new RevisionManager<Object>({}, doNothingPersister);
    r.add({x:'apples'});
    expect(r.next()).toBeNull();
  });
  
  it('adds changes to a new revision', () => {
    const r = new RevisionManager<Object>({}, doNothingPersister);
    r.add({pet:'dog'});
    r.addChanges({name:'Fido'});
    expect(r.currentRevision).toEqual({pet:'dog', name:'Fido'});
  });
  
  it('does not add revision for changes if new values are same as old', () => {
    const r = new RevisionManager<Object>({}, doNothingPersister);
    r.add({pet:'dog'});
    const warnFunc = console.warn;
    console.warn = () => {};
    r.addChanges({pet:'dog'});
    console.warn = warnFunc;
    expect(r.currentRevision).toEqual({pet:'dog'});
  });
  
  it('can adding changes based on initial revision', () => {
    const r = new RevisionManager<Object>({name: 'Fido'}, doNothingPersister);
    r.addChanges({pet:'dog'});
    expect(r.currentRevision).toEqual({name: 'Fido', pet:'dog'});
  });
  
  it('current revision is initial revision after clearing', () => {
    const r = new RevisionManager<Object>({pet:'cat'}, doNothingPersister);
    r.add({pet:'dog'});
    r.clear();
    expect(r.currentRevision).toEqual({pet:'cat'});
  });

  it('current revision is set to new revision after clearing with new revision', () => {
    const r = new RevisionManager<Object>({pet:'cat'}, doNothingPersister);
    r.add({pet:'dog'});
    r.clear({pet:'fish'});
    expect(r.currentRevision).toEqual({pet:'fish'});
  });
  
  describe('persistence', () => {
    it('calls persister when adding a revision', async () => {
      const persister = jest.fn();
      const r = new RevisionManager<Object>({},async (text) => { persister(text) });
      r.add({x:'hey!'});
      await wait(600);
      expect(persister).toBeCalledWith({x:'hey!'});
    });

    it('does not call persister for initial revision', async () => {
      const persister = jest.fn();
      const r = new RevisionManager<Object>({x:'hey!'}, 
        async (text) => { persister(text) });
      await wait(600);
      expect(persister).not.toBeCalled();
    });
    
    it('does not call persister immediately after when adding a revision', async () => {
      const persister = jest.fn();
      const r = new RevisionManager<Object>({},async (text) => { persister(text) });
      r.add({x:'hey!'});
      expect(persister).not.toBeCalled();
    });
    
    it('calls persister with just the last revision when adding multiple revisions immediately in sequence', async () => {
      const persister = jest.fn();
      const r = new RevisionManager<Object>({},async (text) => { persister(text) });
      r.add({x:'apples'});
      r.add({x:'bananas'});
      r.add({x:'cantaloupes'});
      await wait(600);
      expect(persister).not.toBeCalledWith({x:'apples'});
      expect(persister).not.toBeCalledWith({x:'bananas'});
      expect(persister).toBeCalledWith({x:'cantaloupes'});
    });

    it('calls persister immediately when calling persistCurrent()', async () => {
      const persister = jest.fn();
      const r = new RevisionManager<Object>({}, async (text) => { persister(text) });
      r.add({x:'hey!'});
      await r.persistCurrent();
      expect(persister).toBeCalledWith({x:'hey!'});
    });

    it('catches exceptions thrown by persister when calling add() and waiting', async () => {
      const persister = jest.fn();
      const r = new RevisionManager<Object>({}, async (text) => { persister(text) });
      persister.mockImplementationOnce(() => { throw new Error('oops!') });
      r.add({x:'hey!'});
      const errorFunc = console.error;
      console.error = () => {};
      await wait(600);
      console.error = errorFunc;
      expect(persister).toBeCalledWith({x:'hey!'});
    });
    
    it('catches exceptions thrown by persister when calling persistCurrent()', async () => {
      const persister = jest.fn();
      const r = new RevisionManager<Object>({}, async (text) => { persister(text) });
      persister.mockImplementationOnce(() => { throw new Error('oops!') });
      r.add({x:'hey!'});
      const errorFunc = console.error;
      console.error = () => {};
      await r.persistCurrent();
      console.error = errorFunc;
      expect(persister).toBeCalledWith({x:'hey!'});
    });
  });
});