import {scaleDimensionsToFit} from "common/scaleUtil";

function _drawSolidBackground(context:CanvasRenderingContext2D) {
  context.fillStyle = 'white';
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
}

const CHOOSE_BACKGROUND_TEXT = 'No Background Image';
function _drawNoBackground(context:CanvasRenderingContext2D) {
  const textMetrics = context.measureText(CHOOSE_BACKGROUND_TEXT);
  _drawSolidBackground(context);
  context.fillStyle = 'grey';
  context.fillText(CHOOSE_BACKGROUND_TEXT, (context.canvas.width - textMetrics.width) / 2, context.canvas.height / 2);
}

function _drawBackground(context:CanvasRenderingContext2D, backgroundImage:ImageBitmap) {
  const { width:canvasWidth, height:canvasHeight } = context.canvas;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  const { width:backgroundWidth, height:backgroundHeight } = backgroundImage;
  const [scaledWidth, scaledHeight] = scaleDimensionsToFit(backgroundWidth, backgroundHeight, canvasWidth, canvasHeight);
  const x = (canvasWidth - scaledWidth) / 2;
  const y = (canvasHeight - scaledHeight) / 2;
  context.drawImage(backgroundImage, x, y, scaledWidth, scaledHeight);
}

export function onDrawPlacementCanvas(context:CanvasRenderingContext2D, backgroundImage:ImageBitmap|null) {
  if (backgroundImage) {
    _drawBackground(context, backgroundImage);
  } else {
    _drawNoBackground(context);
  }
}