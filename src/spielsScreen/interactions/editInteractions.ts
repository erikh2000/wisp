import EditSpielNodeDialog from "spielsScreen/spielDialogs/EditSpielNodeDialog";
import {updateRevisionForSpiel} from "spielsScreen/interactions/revisionUtil";

import { Spiel } from 'sl-spiel';

export function editSpielNode(spiel:Spiel, nodeNo:number, setRevision:Function, setModalDialog:Function) {
  const nextSpiel = spiel.duplicate();
  nextSpiel.moveTo(nodeNo);
  updateRevisionForSpiel(nextSpiel, setRevision);
  setModalDialog(EditSpielNodeDialog.name);
}

export function selectSpielNode(spiel:Spiel, nodeNo:number, setRevision:Function) {
  const nextSpiel = spiel.duplicate();
  nextSpiel.moveTo(nodeNo);
  updateRevisionForSpiel(nextSpiel, setRevision);
}