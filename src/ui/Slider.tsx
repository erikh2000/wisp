import styles from "./Slider.module.css";
import { clamp } from "common/numberUtil";

import {useState, useRef, useEffect} from "react";

interface IProps {
  value: number;
  onChange: (value:number) => void;
}

type LayoutMeasurements = {
  clientToContainerOffsetX: number;
  containerWidth: number;
  thumbWidth: number;
  travelWidth: number;
  minX: number;
  maxX: number;
}

function _initLayoutMeasurements():LayoutMeasurements {
  return { clientToContainerOffsetX:0, containerWidth: 0, thumbWidth: 0, travelWidth: 0, minX: 0, maxX: 0 };
}
function _calcLayoutMeasurements(container:HTMLDivElement, thumb:HTMLSpanElement):LayoutMeasurements {
  const thumbWidth = thumb.clientWidth;
  const containerWidth = container.clientWidth;
  const paddingWidth = Math.round(thumbWidth * .7);
  const travelWidth = containerWidth - (paddingWidth*2);
  const clientToContainerOffsetX = container.getBoundingClientRect().left;
  return { clientToContainerOffsetX, containerWidth, thumbWidth, travelWidth, minX: paddingWidth, maxX: paddingWidth + travelWidth };
}

function _calcThumbPosFromValue(value:number, layoutMeasurements:LayoutMeasurements):number {
  const {minX, travelWidth, thumbWidth} = layoutMeasurements;
  return minX + ((value/100) * travelWidth) - (thumbWidth/2);
}

function _calcValueFromThumbPos(thumbPos:number, layoutMeasurements:LayoutMeasurements):number {
  const {maxX, minX, thumbWidth, travelWidth} = layoutMeasurements;
  const ratio = (clamp(thumbPos + (thumbWidth/2), minX, maxX) - minX) / travelWidth;
  return Math.round(ratio * 100);
}

function _calcThumbPosFromDragX(dragX:number, layoutMeasurements:LayoutMeasurements):number {
  const {minX, maxX, thumbWidth} = layoutMeasurements;
  return clamp(dragX, minX, maxX) - (thumbWidth/2);
}

function _updateLayoutMeasurementsAndThumbPos(container:HTMLDivElement, thumb:HTMLSpanElement, value:number, setLayoutMeasurements:Function, setThumbPos:Function) {
  const nextLayoutMeasurements = _calcLayoutMeasurements(container, thumb);
  setLayoutMeasurements(nextLayoutMeasurements);
  setThumbPos(_calcThumbPosFromValue(value, nextLayoutMeasurements));
}

function Slider(props:IProps) {
  const {onChange, value} = props;
  const [thumbPos, setThumbPos] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [wasDragging, setWasDragging] = useState<boolean>(false);
  const [layoutMeasurements, setLayoutMeasurements] = useState<LayoutMeasurements>(_initLayoutMeasurements());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);

  useEffect(() => { // Handle mount.
    const container:HTMLDivElement|null = containerRef?.current;
    const thumb:HTMLSpanElement|null = thumbRef?.current;
    if (!container || !thumb) return;
    _updateLayoutMeasurementsAndThumbPos(container, thumb, value, setLayoutMeasurements, setThumbPos);
    
    const _onResize = () => _updateLayoutMeasurementsAndThumbPos(container, thumb, value, setLayoutMeasurements, setThumbPos);
    const _onMouseUp = () => setIsDragging(false);
    
    window.addEventListener('resize', _onResize, false);
    window.addEventListener('mouseup', _onMouseUp, false);
    
    return () => {
      window.removeEventListener('resize', _onResize, false);
      window.removeEventListener('mouseup', _onMouseUp, false);
    }
  }, [setThumbPos, setLayoutMeasurements, value]);
  
  useEffect(() => {
    if (isDragging === wasDragging) return;
    if (!isDragging) onChange(_calcValueFromThumbPos(thumbPos, layoutMeasurements));
    setWasDragging(isDragging);
  }, [thumbPos, isDragging, wasDragging, layoutMeasurements]);
  
  return (
    <div 
      className={styles.container} 
      ref={containerRef}
      onMouseMoveCapture={(event) => {
        const dragX = event.nativeEvent.clientX - layoutMeasurements.clientToContainerOffsetX; 
        if (isDragging) { setThumbPos(_calcThumbPosFromDragX(dragX, layoutMeasurements)); }
      }}
    >
      <div className={styles.groove} />
      <span 
        className={styles.thumb}
        onMouseDown={() => { setIsDragging(true); }}
        style={{left: `${thumbPos}px`}} 
        ref={thumbRef}
      />
    </div>
  );
}

export default Slider;