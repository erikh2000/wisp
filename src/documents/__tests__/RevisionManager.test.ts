import RevisionManager from "../RevisionManager";

describe('RevisionManager', () => {
  it('constructs', () => {
    const r = new RevisionManager<string>();
  });
  
  it('adds a revision', () => {
    const r = new RevisionManager<string>();
    r.add('hey!');
    expect(r.currentRevision).toEqual('hey!');
  });
  
  it('adds two revisions', () => {
    const r = new RevisionManager<string>();
    r.add('apples');
    r.add('bananas');
    expect(r.currentRevision).toEqual('bananas');
  });

  it('returns to previous revision', () => {
    const r = new RevisionManager<string>();
    r.add('apples');
    r.add('bananas');
    expect(r.prev()).toEqual('apples');
  });

  it('returns to next revision', () => {
    const r = new RevisionManager<string>();
    r.add('apples');
    r.add('bananas');
    r.prev();
    expect(r.next()).toEqual('bananas');
  });

  it('adding a revision from an earlier index will clear the later revisions', () => {
    const r = new RevisionManager<string>();
    r.add('apples');
    r.add('bananas');
    r.add('canteloupes');
    r.prev();
    r.prev();
    r.add('buffalo');
    expect(r.next()).toBeNull();
  });
  
  it('currentRevision returns null when no revisions', () => {
    const r = new RevisionManager<string>();
    expect(r.currentRevision).toBeNull();
  });
  
  it('prev() returns null when no revisions', () => {
    const r = new RevisionManager<string>();
    expect(r.prev()).toBeNull();
  });

  it('prev() returns null when at beginning of revisions', () => {
    const r = new RevisionManager<string>();
    r.add('apples');
    expect(r.prev()).toBeNull();
  });

  it('next() returns null when no revisions', () => {
    const r = new RevisionManager<string>();
    expect(r.next()).toBeNull();
  });

  it('next() returns null when at end of revisions', () => {
    const r = new RevisionManager<string>();
    r.add('apples');
    expect(r.next()).toBeNull();
  });
});