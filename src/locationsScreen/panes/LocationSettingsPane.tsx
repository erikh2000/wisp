import styles from "./LocationSettingsPane.module.css";
import LocationFaces from "locationsScreen/interactions/LocationFaces";
import { onDrawPlacementCanvas } from "locationsScreen/interactions/placementInteractions";
import FacePlacement from "persistence/types/FacePlacement";
import Canvas from "ui/Canvas";
import InnerContentPane, {ButtonDefinition} from "ui/innerContentPane/InnerContentPane";

import React from "react";

interface IProps {
  backgroundImage:ImageBitmap|null,
  disabled:boolean,
  facePlacements:FacePlacement[],
  locationFaces:LocationFaces,
  onAddFace:() => void,
  onDeleteFace:(faceName:string) => void,
  onCanvasMouseUp?:Function,
  onCanvasMouseDown?:Function,
  onCanvasMouseMove?:Function,
  onChooseBackground:(backgroundImage:ImageBitmap) => void
}

function _generateButtonDefinitions(onAddFace:Function, onDeleteFace:Function, onChooseBackground:Function, disabled:boolean):ButtonDefinition[] {
  return [
    {text:'Add Face', onClick:() => onAddFace(), disabled},
    {text:'Delete Face', onClick:() => onDeleteFace(), disabled:true},
    {text:'Choose Background', onClick:() => onChooseBackground(), disabled}
  ];
}

function LocationSettingsPane(props:IProps) {
  const {backgroundImage, disabled, onAddFace, onCanvasMouseMove, onCanvasMouseUp, onCanvasMouseDown, 
    onDeleteFace, onChooseBackground, locationFaces, facePlacements} = props;

  const buttons = _generateButtonDefinitions(onAddFace, onDeleteFace, onChooseBackground, disabled);
  
  return  (
    <InnerContentPane className={styles.locationSettingsPane} caption='Location Settings' buttons={buttons}>
      <Canvas 
        isAnimated={true} 
        onDraw={(context) => onDrawPlacementCanvas(context, backgroundImage, locationFaces, facePlacements)}
        onMouseDown={(event) => { if (onCanvasMouseDown) onCanvasMouseDown(event); }}
        onMouseMove={(event) => { if (onCanvasMouseMove) onCanvasMouseMove(event); }}
        onMouseUp={(event) => { if (onCanvasMouseUp) onCanvasMouseUp(event); }}
        className={styles.placementCanvas}
      />
    </InnerContentPane>
  );
}

export default LocationSettingsPane;