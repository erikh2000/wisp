import Canvas from "ui/Canvas";
import EmotionSelector from "ui/EmotionSelector";
import LidLevelSelector from "ui/LidLevelSelector";
import VisemeSelector from "ui/VisemeSelector";
import SaySelector from "ui/SaySelector";
import ScreenContainer from 'ui/screen/ScreenContainer';
import styles from './FaceBuilderScreen.module.css';
import Screen from 'ui/screen/screens';

import React, {useEffect} from 'react';

import { CanvasComponent, loadFaceFromUrl, AttentionController, BlinkController } from "sl-web-face";

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

function _onDrawCanvas(context:CanvasRenderingContext2D) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  if (!isInitialized || !head) return;
  head.renderWithChildren(context);
}

function FaceBuilderScreen() {
  useEffect(() => {
    if (isInitialized) return;
    _init()
      .then(() => isInitialized = true);
  }, []);
  
  return (
    <ScreenContainer isControlPaneOpen={true} activeScreen={Screen.FACES}>
      <div className={styles.container}>
        <div className={styles.configPanel}>
          <EmotionSelector />
          <LidLevelSelector />
          <VisemeSelector />
          <SaySelector />
        </div>
        <Canvas className={styles.canvas} isAnimated={true} onDraw={_onDrawCanvas} />
      </div>
    </ScreenContainer>
  );
}

export default FaceBuilderScreen;