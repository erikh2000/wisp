import styles from "./LocationSettingsPane.module.css";
import { onDrawPlacementCanvas } from "locationsScreen/interactions/placementInteractions";
import Canvas from "ui/Canvas";
import InnerContentPane, {ButtonDefinition} from "ui/innerContentPane/InnerContentPane";

import React from "react";


interface IProps {
  backgroundImage:ImageBitmap|null,
  disabled:boolean
  onAddFace:() => void,
  onDeleteFace:(faceName:string) => void,
  onChooseBackground:(backgroundImage:ImageBitmap) => void
}

function _generateButtonDefinitions(onAddFace:Function, onDeleteFace:Function, onChooseBackground:Function, disabled:boolean):ButtonDefinition[] {
  return [
    {text:'Add Face', onClick:() => onAddFace(), disabled:true},
    {text:'Delete Face', onClick:() => onDeleteFace(), disabled:true},
    {text:'Choose Background', onClick:() => onChooseBackground(), disabled}
  ];
}

function LocationSettingsPane(props:IProps) {
  const {backgroundImage, disabled, onAddFace, onDeleteFace, onChooseBackground} = props;

  const buttons = _generateButtonDefinitions(onAddFace, onDeleteFace, onChooseBackground, disabled);
  
  return  (
    <InnerContentPane className={styles.locationSettingsPane} caption='Location Settings' buttons={buttons}>
      <Canvas isAnimated={true} onDraw={(context) => onDrawPlacementCanvas(context, backgroundImage)} className={styles.placementCanvas}/>
    </InnerContentPane>
  );
}

export default LocationSettingsPane;