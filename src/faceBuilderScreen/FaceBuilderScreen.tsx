import Canvas from "ui/Canvas";
import EmotionSelector from "ui/EmotionSelector";
import LidLevelSelector from "ui/LidLevelSelector";
import VisemeSelector from "ui/VisemeSelector";
import SaySelector from "ui/SaySelector";
import styles from './FaceBuilderScreen.module.css';

import React, {useEffect} from 'react';

import { CanvasComponent, publishEvent, Topic, loadFaceFromUrl, AttentionController, BlinkController } from "sl-web-face";

let head:CanvasComponent|null = null;
let isInitialized = false;
const blinkController = new BlinkController();
const attentionController = new AttentionController();

async function _init():Promise<void> {
  head = await loadFaceFromUrl('/faces/billy.yml');
  head.offsetX = 50;
  head.offsetY = 30;
  blinkController.start();
  attentionController.start();
}

function _onDrawCanvas(context:CanvasRenderingContext2D, _frameCount:number) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  if (!isInitialized || !head) return;
  head.renderWithChildren(context);
}

function _onClick(event:any) {
  const dx = (event.screenX - window.screen.width/2) / window.screen.width;
  const dy = (event.screenY - window.screen.height/2) / window.screen.height;
  publishEvent(Topic.ATTENTION, {dx, dy});
}

function FaceBuilderScreen() {
  useEffect(() => {
    if (isInitialized) return;
    _init()
      .then(() => isInitialized = true);
  }, []);
  
  return (
    <div className={styles.app} onClick={_onClick}>
      <div className={styles.configPanel}>
        <EmotionSelector />
        <LidLevelSelector />
        <VisemeSelector />
        <SaySelector />
      </div>
      <Canvas className={styles.canvas} isAnimated={true} onDraw={_onDrawCanvas} />
    </div>
  );
}

export default FaceBuilderScreen;