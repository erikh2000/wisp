import styles from "./TestPane.module.css";
import {isRecognizerReady, onDrawFaceCanvas} from "spielsScreen/interactions/testInteractions";
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
  playFullScreen:boolean,
  onChangeFace:EmptyCallback,
  onExitFullScreen:EmptyCallback,
  onOptions:EmptyCallback,
  onStart:EmptyCallback,
  onStop:EmptyCallback,
  subtitle:string|null
}

function _generateButtonDefinitions(isTestRunning:boolean, onChangeFace:EmptyCallback, onOptions:EmptyCallback, 
                                    onStart:EmptyCallback, onStop:EmptyCallback, disabled?:boolean):ButtonDefinition[] {
  const toggleStartStop = isTestRunning ? {text:'Stop', onClick:onStop, disabled} : {text:'Start', onClick:onStart, disabled};
  return [
    {text:'Options', onClick:onOptions, disabled},
    {text:'Change Face', onClick:onChangeFace, disabled},
    toggleStartStop
  ];
}

function TestPane(props:IProps) {
  const { disabled, isTestRunning, headComponent, onChangeFace, 
    onExitFullScreen, onOptions, onStart, onStop, 
    subtitle, playFullScreen } = props;
  const isRecognizing = isRecognizerReady(); 
  const useDisabled = disabled || headComponent === null || !isRecognizing;
  
  const isFullScreen = playFullScreen && headComponent !== null && isTestRunning;
  const faceContent:JSX.Element = headComponent !== null && isRecognizing 
    ? <Canvas className={styles.faceCanvas} 
              onDraw={context => onDrawFaceCanvas(context, headComponent)} 
              onExitFullScreen={onExitFullScreen}
              isAnimated={true} 
              isFullScreen={isFullScreen}
      />
    : headComponent === null 
      ? <LoadingBox className={styles.loadingBox} text='loading face' />
      : <LoadingBox className={styles.loadingBox} text='loading language model' />;
  
  const buttonDefs = _generateButtonDefinitions(isTestRunning, onChangeFace, onOptions, onStart, onStop, useDisabled);
  
  const caption = isTestRunning ? 'Test (running)' : 'Test';
  return (
    <InnerContentPane className={styles.testPane} caption={caption} buttons={buttonDefs}>
      {faceContent}
      <span className={styles.subtitle}>{subtitle}</span>
    </InnerContentPane>
  );
}

export default TestPane;