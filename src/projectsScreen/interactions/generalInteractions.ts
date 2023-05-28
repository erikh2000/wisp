import {getRevisionManager, Revision} from "./revisionUtil";
import {bindSetDisabled, initCore} from "./coreUtil";
import RevisionManager from "documents/RevisionManager";
import {getActiveProjectName} from "persistence/projects";

type InitResults = {
  projectName:string
}

let isInitialized = false;

/* Handle any initialization needed for mount after a previous initialization was completed. This will cover
   refreshing any module-scope vars that stored instances tied to a React component's lifetime and calling setters
   to on React components to synchronize their state with module-scope vars. */
function _initForSubsequentMount(revisionManager:RevisionManager<Revision>, setDisabled:Function) {
  bindSetDisabled(setDisabled);
  // If I later find there is state in revisions that needs to be kept, change the code here to add it to a first revision.
  revisionManager.clear();
}

export async function init(setDisabled:Function, setRevision:Function):Promise<InitResults> {
  const projectName = await getActiveProjectName();
  const initResults:InitResults = { projectName };

  const revisionManager = getRevisionManager();
  revisionManager.disablePersistence();

  if (isInitialized) {
    _initForSubsequentMount(revisionManager, setDisabled);
    return initResults
  }

  await initCore(setDisabled);
  
  const revision = {  };
  revisionManager.add(revision);
  revisionManager.enablePersistence();
  setRevision(revisionManager.currentRevision);

  isInitialized = true;
  return initResults;
}