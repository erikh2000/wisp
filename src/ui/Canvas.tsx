import React, {useRef, useEffect, useState} from 'react'

const NO_ANIMATION_IN_PROGRESS = -1;
let animationFrameId = NO_ANIMATION_IN_PROGRESS;

interface IDrawCallback {
  (context:CanvasRenderingContext2D):void;
}

interface IProps {
  className:string,
  isAnimated:boolean,
  onClick?:any,
  onDraw:IDrawCallback,
  onMouseMove?:any,
  onMouseDown?:any,
  onMouseUp?:any
}

function _updateCanvasDimensions(container:HTMLDivElement, setContainerDimensions:any) {
  const nextDimensions:[number,number] = [container.clientWidth, container.clientHeight];
  setContainerDimensions(nextDimensions);
}

function Canvas(props:IProps) {
  const [containerDimensions, setContainerDimensions] = useState<[number,number]|null>(null);
  const { className, onClick, onDraw, onMouseDown, onMouseMove, onMouseUp, isAnimated } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, canvasHeight] = containerDimensions ?? [0,0];

  useEffect(() => { // Handle mount.
    const container:HTMLDivElement|null = containerRef?.current, canvas:HTMLCanvasElement|null = canvasRef?.current;
    if (!container || !canvas) return;
    _updateCanvasDimensions(container, setContainerDimensions);
    window.addEventListener('resize', () => { _updateCanvasDimensions(container, setContainerDimensions);}, false);
  }, []);
  
  useEffect(() => { // Handle drawing.
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    
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
  
  return (
    <div className={className} ref={containerRef}> 
      <canvas onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onClick={onClick} width={canvasWidth} height={canvasHeight} ref={canvasRef} />
    </div>
  );
}

export default Canvas;