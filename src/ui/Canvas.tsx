import React, { useRef, useEffect, useState } from 'react'

interface IDrawCallback {
  (context:CanvasRenderingContext2D):void;
}

interface IProps {
  className:string,
  isAnimated:boolean,
  onClick?:any,
  onDraw:IDrawCallback,
  onMouseMove?:any
}

function _updateCanvasDimensions(container:HTMLDivElement, setContainerDimensions:any, canvas:HTMLCanvasElement, onDraw:IDrawCallback) {
  const nextDimensions:[number,number] = [container.clientWidth, container.clientHeight];
  setContainerDimensions(nextDimensions);
  const context = canvas.getContext('2d');
  if (context) onDraw(context);
}

function Canvas(props:IProps) {
  const [containerDimensions, setContainerDimensions] = useState<[number,number]|null>(null);
  const { className, onClick, onDraw, onMouseMove, isAnimated } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, canvasHeight] = containerDimensions ?? [0,0];

  useEffect(() => {
    const container:HTMLDivElement|null = containerRef?.current, canvas:HTMLCanvasElement|null = canvasRef?.current;
    if (!container || !canvas) return;
    _updateCanvasDimensions(container, setContainerDimensions, canvas, onDraw);
    window.addEventListener('resize', () => { _updateCanvasDimensions(container, setContainerDimensions, canvas, onDraw);}, false);
  }, []);
  
  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    
    let animationFrameId = -1;

    const render = () => {
      onDraw(context);
      if (isAnimated) animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      if (isAnimated) window.cancelAnimationFrame(animationFrameId);
    }
  }, [onDraw, isAnimated]);
  
  return (<div className={className} ref={containerRef}> 
      <canvas onMouseMove={onMouseMove} onClick={onClick} width={canvasWidth} height={canvasHeight} ref={canvasRef} />
    </div>);
}

export default Canvas;