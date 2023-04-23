export function clearContext(context:CanvasRenderingContext2D) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}
export function createOffScreenContext(width:number, height:number):CanvasRenderingContext2D {
  const offScreenCanvas:any = document.createElement('canvas');
  offScreenCanvas.width = width;
  offScreenCanvas.height = height;
  const context = offScreenCanvas.getContext('2d', {willReadFrequently:true});
  clearContext(context);
  return context;
}

export async function contextToImageBitmap(context:CanvasRenderingContext2D):Promise<ImageBitmap> {
  const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  return await createImageBitmap(imageData);
}