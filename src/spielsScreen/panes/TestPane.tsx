import styles from "./TestPane.module.css";
import { onDrawFaceCanvas } from "spielsScreen/interactions/testInteractions";
import Canvas from "ui/Canvas";
import InnerContentPane, { ButtonDefinition } from "ui/innerContentPane/InnerContentPane";
import LoadingBox from "ui/LoadingBox";

import React from 'react';
import {CanvasComponent} from "sl-web-face";

type EmptyCallback = () => void;
interface IProps {
  disabled?:boolean,
  headComponent:CanvasComponent|null,
  isTestRunning:boolean,
  onChangeFace:EmptyCallback,
  onStart:EmptyCallback,
  onStop:EmptyCallback
}

function _generateButtonDefinitions(isTestRunning:boolean, onChangeFace:EmptyCallback, onStart:EmptyCallback, 
                                    onStop:EmptyCallback, disabled?:boolean):ButtonDefinition[] {
  const toggleStartStop = isTestRunning ? {text:'Stop', onClick:onStop, disabled} : {text:'Start', onClick:onStart, disabled};
  return [
    {text:'Change Face', onClick:onChangeFace, disabled},
    toggleStartStop
  ];
}

function TestPane(props:IProps) {
  const { disabled, isTestRunning, headComponent, onChangeFace, onStart, onStop } = props;
  
  const faceContent:JSX.Element = headComponent !== null 
    ? <Canvas className={styles.faceCanvas} onDraw={context => onDrawFaceCanvas(context, headComponent)} isAnimated={true} />
    : <LoadingBox className={styles.faceLoadingBox} text='loading face' />;
  
  const buttonDefs = _generateButtonDefinitions(isTestRunning, onChangeFace, onStart, onStop, disabled);
  
  return (
    <InnerContentPane className={styles.testPane} caption='Test' buttons={buttonDefs}>
      {faceContent}
    </InnerContentPane>
  );
}

export default TestPane;