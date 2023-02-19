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
  onStop:EmptyCallback,
  subtitle:string|null
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
  const { disabled, isTestRunning, headComponent, onChangeFace, onStart, onStop, subtitle } = props;
  
  const faceContent:JSX.Element = headComponent !== null 
    ? <Canvas className={styles.faceCanvas} onDraw={context => onDrawFaceCanvas(context, headComponent)} isAnimated={true} />
    : <LoadingBox className={styles.faceLoadingBox} text='loading face' />;
  
  const buttonDefs = _generateButtonDefinitions(isTestRunning, onChangeFace, onStart, onStop, disabled);
  
  const caption = isTestRunning ? 'Test (running)' : 'Test';
  return (
    <InnerContentPane className={styles.testPane} caption={caption} buttons={buttonDefs}>
      {faceContent}
      <span className={styles.subtitle}>{subtitle}</span>
    </InnerContentPane>
  );
}

export default TestPane;