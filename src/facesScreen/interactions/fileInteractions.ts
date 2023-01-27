import {setActiveFaceName} from "persistence/projects";

export function onNewFaceName(faceName:string, setModalDialog:any, setDocumentName:any) {
  setActiveFaceName(faceName).then(() => {
    setDocumentName(faceName);
    setModalDialog(null);
  });
}