import {getRevisionManager} from "./revisionUtil";

export function onChangeEntrySpielName(entrySpielName:string, setRevision:Function) {
  const revisionManager = getRevisionManager();
  revisionManager.addChanges({entrySpielName});
  const nextRevision = revisionManager.currentRevision;
  setRevision(nextRevision);
}

export function onChangeAboutText(aboutText:string, setRevision:Function) {
  const revisionManager = getRevisionManager();
  revisionManager.addChanges({aboutText});
  const nextRevision = revisionManager.currentRevision;
  setRevision(nextRevision);
}

export function onChangeCreditsText(creditsText:string, setRevision:Function) {
  const revisionManager = getRevisionManager();
  revisionManager.addChanges({creditsText});
  const nextRevision = revisionManager.currentRevision;
  setRevision(nextRevision);
}

export function onChangeLanguageCode(languageCode:string, setRevision:Function) {
  const revisionManager = getRevisionManager();
  revisionManager.addChanges({languageCode});
  const nextRevision = revisionManager.currentRevision;
  setRevision(nextRevision);
}