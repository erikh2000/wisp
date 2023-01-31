import styles from "./TestPane.module.css";
import useEffectAfterMount from "common/useEffectAfterMount";
import Canvas from "ui/Canvas";
import InnerContentPane, { ButtonDefinition } from "ui/innerContentPane/InnerContentPane";
import LoadingBox from "ui/LoadingBox";

import React, {useState} from 'react';
import {CanvasComponent, loadFaceFromUrl} from "sl-web-face";

interface IProps {
  disabled?:boolean
}

function _generateButtonDefinitions(disabled?:boolean):ButtonDefinition[] {
  return [{text:'Change Face', onClick:() => {}, disabled}, {text:'Start', onClick:() => {}, disabled}];
}

function _centerCanvasComponent(component:CanvasComponent, canvasWidth:number, canvasHeight:number) { // TODO - refactor
  const componentWidth = component.width, componentHeight = component.height;
  component.offsetX = Math.round((canvasWidth - componentWidth) / 2);
  component.offsetY = Math.round((canvasHeight - componentHeight) / 2);
}

export function onDrawFaceCanvas(context:CanvasRenderingContext2D, headComponent:CanvasComponent) { // TODO - refactor
  const canvasWidth = context.canvas.width, canvasHeight = context.canvas.height;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  _centerCanvasComponent(headComponent, canvasWidth, canvasHeight);
  headComponent.render(context);
}

export async function initTestPane():Promise<CanvasComponent> { // TODO - refactor
  return await loadFaceFromUrl('/faces/default.face'); // TODO - use active face from persistent store.
}

function TestPane(props:IProps) {
  const { disabled } = props;
  const [headComponent, setHeadComponent] = useState<CanvasComponent|null>(null);
  
  useEffectAfterMount(() => {
    initTestPane().then(nextHeadComponent => setHeadComponent(nextHeadComponent));
  }, [])
  
  const faceContent:JSX.Element = headComponent !== null 
    ? <Canvas className={styles.faceCanvas} onDraw={context => onDrawFaceCanvas(context, headComponent)} isAnimated={true} />
    : <LoadingBox className={styles.faceLoadingBox} text='loading face' />;
  
  return (
    <InnerContentPane className={styles.testPane} caption='Test' buttons={_generateButtonDefinitions(disabled)}>
      {faceContent}
    </InnerContentPane>
  );
}

export default TestPane;