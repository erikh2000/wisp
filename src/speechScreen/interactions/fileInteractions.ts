import {setActiveSpielName, UNSPECIFIED_NAME} from "persistence/projects";
import {getSpiel} from "persistence/spiels";
import {getRevisionManager} from "speechScreen/interactions/revisionUtil";
import {performDisablingOperation} from "speechScreen/interactions/coreUtil";
import {setUpRevisionForNewSpiel} from "speechScreen/interactions/revisionUtil";

export async function onOpenSpiel(spielName:string, setDocumentName:Function, setRevision:Function, setModalDialog:Function) {
  await performDisablingOperation(async () => {
    const revisionManager = getRevisionManager();
    await revisionManager.persistCurrent();
    setDocumentName(UNSPECIFIED_NAME); // If anything fails, it's better to leave the document name cleared to avoid overwriting a previous spiel.
    await setActiveSpielName(UNSPECIFIED_NAME);
    await revisionManager.waitForPersist();
    const spielText = await getSpiel(spielName);
    await setUpRevisionForNewSpiel(spielName, spielText, setRevision);
    await setActiveSpielName(spielName);
    setDocumentName(spielName);
    setModalDialog(null);
  });
}