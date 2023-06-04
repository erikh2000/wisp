import styles from './Canvas.module.css';
import React, {useRef, useEffect, useState, CSSProperties, MouseEventHandler} from 'react'

const NO_ANIMATION_IN_PROGRESS = -1;
let animationFrameId = NO_ANIMATION_IN_PROGRESS;

interface IDrawCallback {
  (context:CanvasRenderingContext2D):void;
}

interface IProps {
  className:string,
  isAnimated:boolean,
  isFullScreen?:boolean,
  onClick?:MouseEventHandler<HTMLCanvasElement>,
  onDraw:IDrawCallback,
  onExitFullScreen?:() => void,
  onMouseMove?:MouseEventHandler<HTMLCanvasElement>,
  onMouseDown?:MouseEventHandler<HTMLCanvasElement>,
  onMouseUp?:MouseEventHandler<HTMLCanvasElement>
}

function _updateCanvasDimensions(container:HTMLDivElement, setContainerDimensions:Function, setFullScreenCanvasStyle:Function) {
  const CX_PADDING = 8, CY_PADDING = 8; // I would like to figure out what is causing the need for this padding.
  const nextDimensions:[number,number] = [container.clientWidth - CX_PADDING, container.clientHeight - CY_PADDING];
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const nextFullScreenCanvasStyle:CSSProperties = { position:'fixed', top:`0`, left:`0`, width:`${screenWidth}px`, height: `${screenHeight}px`, zIndex:1000 };
  setContainerDimensions(nextDimensions);
  setFullScreenCanvasStyle(nextFullScreenCanvasStyle);
}

function Canvas(props:IProps) {
  const [containerDimensions, setContainerDimensions] = useState<[number,number]|null>(null);
  const [fullScreenCanvasStyle, setFullScreenCanvasStyle] = useState<CSSProperties>({});
  const { className, onClick, onDraw, onExitFullScreen, 
    onMouseDown, onMouseMove, onMouseUp, 
    isAnimated, isFullScreen } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, canvasHeight] = containerDimensions ?? [0,0];

  useEffect(() => { // Handle mount.
    const container:HTMLDivElement|null = containerRef?.current;
    if (!container) return;
    window.addEventListener('resize', () => { _updateCanvasDimensions(container, setContainerDimensions, setFullScreenCanvasStyle);}, false);
  }, []);
  
  useEffect(() => { // Handle drawing.
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    const container:HTMLDivElement|null = containerRef?.current;
    if (container) _updateCanvasDimensions(container, setContainerDimensions, setFullScreenCanvasStyle);
    
    const render = () => {
      onDraw(context);
      if (isAnimated) animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      if (isAnimated) window.cancelAnimationFrame(animationFrameId);
    }
  }, [onDraw, isAnimated]);

  useEffect(() => { // Handle redrawing after canvas dimensions are updated.
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    onDraw(context);
  }, [onDraw, containerDimensions]);
  
  const canvasStyle:CSSProperties = isFullScreen ? fullScreenCanvasStyle : {};
  const exitFullScreenButton = isFullScreen && onExitFullScreen ? 
    <button className={styles.exitButton} onClick={() => onExitFullScreen()}>Exit Fullscreen</button> : null;
  
  return (
    <div className={className} ref={containerRef}>
      {exitFullScreenButton}  
      <canvas 
        style={canvasStyle} 
        onMouseMove={onMouseMove} 
        onMouseDown={onMouseDown} 
        onMouseUp={onMouseUp} 
        onClick={onClick} 
        width={canvasWidth} 
        height={canvasHeight} 
        ref={canvasRef} 
      />
    </div>
  );
}

export default Canvas;