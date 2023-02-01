import styles from "./TestPane.module.css";
import { onDrawFaceCanvas } from "spielsScreen/interactions/testInteractions";
import Canvas from "ui/Canvas";
import InnerContentPane, { ButtonDefinition } from "ui/innerContentPane/InnerContentPane";
import LoadingBox from "ui/LoadingBox";

import React from 'react';
import {CanvasComponent } from "sl-web-face";

interface IProps {
  headComponent:CanvasComponent|null,
  disabled?:boolean,
  onChangeFace:() => void
}

function _generateButtonDefinitions(onChangeFace:() => void, disabled?:boolean):ButtonDefinition[] {
  return [
    {text:'Change Face', onClick:onChangeFace, disabled},
    {text:'Start', onClick:() => {}, disabled}
  ];
}

function TestPane(props:IProps) {
  const { disabled, headComponent, onChangeFace } = props;
  
  const faceContent:JSX.Element = headComponent !== null 
    ? <Canvas className={styles.faceCanvas} onDraw={context => onDrawFaceCanvas(context, headComponent)} isAnimated={true} />
    : <LoadingBox className={styles.faceLoadingBox} text='loading face' />;
  
  return (
    <InnerContentPane className={styles.testPane} caption='Test' buttons={_generateButtonDefinitions(onChangeFace, disabled)}>
      {faceContent}
    </InnerContentPane>
  );
}

export default TestPane;