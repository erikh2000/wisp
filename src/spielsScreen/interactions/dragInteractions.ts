import { Spiel } from 'sl-spiel';
import {updateRevisionForSpiel} from "./revisionUtil";

export type DragMeasurements = {
  nodeHeights: number[];
  nodeTops: number[];
}

export function createDragMeasurements():DragMeasurements {
  return {nodeHeights: [], nodeTops: []};
}

function _updateNodeTops(dragMeasurements:DragMeasurements):boolean {
  let top = 0;
  dragMeasurements.nodeTops = [];
  for (let i = 0; i < dragMeasurements.nodeHeights.length; i++) {
    const height:number|undefined = dragMeasurements.nodeHeights[i];
    if (height === undefined) return false;
    dragMeasurements.nodeTops.push(top);
    top += height;
  }
  return true;
}

function _findInsertAfterNodeNo(offsetFromParentY:number, dragMeasurements:DragMeasurements):number|null {
  let startHeight = 0, endHeight = 0;
  for (let i = 0; i < dragMeasurements.nodeHeights.length; i++) {
    const height:number|undefined = dragMeasurements.nodeHeights[i];
    if (height === undefined) return null;
    endHeight += dragMeasurements.nodeHeights[i];
    const middleHeight = (startHeight + endHeight) / 2;
    if (offsetFromParentY < middleHeight) return i - 1;
    startHeight = endHeight;
  }
  return dragMeasurements.nodeHeights.length - 1;
}

export function onNodeDrag(event:any, nodeNo:number, dragMeasurements:DragMeasurements, setInsertAfterNodeNo:Function) {
  if (event.nativeEvent.buttons === 0) return;
  const topOfNode = dragMeasurements.nodeTops[nodeNo];
  if (topOfNode === undefined) return;
  const mousePointerOffsetFromTopOfNode = event.nativeEvent.offsetY;
  const offsetFromParentY = mousePointerOffsetFromTopOfNode + topOfNode;
  const insertAfterNodeNo = _findInsertAfterNodeNo(offsetFromParentY, dragMeasurements);
  setInsertAfterNodeNo(insertAfterNodeNo);
}

export function onNodeDragEnd(startingDragNodeNo:number, insertAfterNodeNo:number|null, spiel:Spiel, setRevision:Function, setInsertAfterNodeNo:Function) {
  setInsertAfterNodeNo(null);
  if (insertAfterNodeNo === null || insertAfterNodeNo === startingDragNodeNo) return;
  
  const insertBeforeNodeNo = insertAfterNodeNo > startingDragNodeNo ? insertAfterNodeNo : insertAfterNodeNo + 1;
  spiel.moveNode(startingDragNodeNo, insertBeforeNodeNo);
  updateRevisionForSpiel(spiel, setRevision);
}

export function updateDragMeasurements(nodeNo:number, height:number, dragMeasurements:DragMeasurements, setDragMeasurements:Function) {
  dragMeasurements.nodeHeights[nodeNo] = height;
  if (_updateNodeTops(dragMeasurements)) {
    setDragMeasurements(dragMeasurements);
  }
}

export function updateDragMeasurementsToMatchNodeCount(nodeCount:number, dragMeasurements:DragMeasurements, setDragMeasurements:Function) {
  dragMeasurements.nodeHeights = dragMeasurements.nodeHeights.slice(0, nodeCount);
  if (_updateNodeTops(dragMeasurements)) {
    setDragMeasurements(dragMeasurements);
  }
}