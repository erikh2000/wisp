import {createDefaultRevision, getRevisionManager, Revision} from "./revisionUtil";
import {bindSetDisabled, initCore} from "./coreUtil";
import RevisionManager from "documents/RevisionManager";
import {getActiveProject, getActiveProjectName, getProjectCount, UNSPECIFIED_NAME} from "persistence/projects";
import {getSpielNames} from "persistence/spiels";

type InitResults = {
  projectName:string,
  projectCount:number,
  spielNames:string[]
}

let isInitialized = false;

/* Handle any initialization needed for mount after a previous initialization was completed. This will cover
   refreshing any module-scope vars that stored instances tied to a React component's lifetime and calling setters
   to on React components to synchronize their state with module-scope vars. */
function _initForSubsequentMount(revisionManager:RevisionManager<Revision>, setDisabled:Function) {
  bindSetDisabled(setDisabled);
}

export async function init(setDisabled:Function, setRevision:Function):Promise<InitResults> {
  const projectName = getActiveProjectName();
  const spielNames = await getSpielNames(projectName);
  const projectCount = await getProjectCount();
  const initResults:InitResults = { projectCount, projectName, spielNames };

  const revisionManager = getRevisionManager();

  if (isInitialized) {
    _initForSubsequentMount(revisionManager, setDisabled);
    return initResults
  }

  await initCore(setDisabled);
  
  if (projectName === UNSPECIFIED_NAME) {
    isInitialized = true;
    return initResults;
  }
  
  const project = await getActiveProject();
  const revision = createDefaultRevision();
  revision.entrySpiel = project.entrySpiel ?? spielNames.length ? spielNames[0] : UNSPECIFIED_NAME; 
  revision.languageCode = project.language;
  revision.aboutText = project.aboutText;
  revision.creditsText = project.creditsText;
  revisionManager.add(revision);
  setRevision(revisionManager.currentRevision);

  isInitialized = true;
  return initResults;
}