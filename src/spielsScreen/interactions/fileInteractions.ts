import {setActiveSpielName} from "persistence/projects";

export function onNewSpielName(spielName:string, setModalDialog:Function, setDocumentName:Function) {
  setActiveSpielName(spielName).then(() => {
    setDocumentName(spielName);
    setModalDialog(null);
  });
}