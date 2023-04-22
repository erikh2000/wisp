import styles from "./TrimSlider.module.css";

import {useEffect, useRef, useState} from "react";
import {clamp} from "../../common/numberUtil";

interface IProps {
  leftValue: number;
  rightValue: number;
  onLeftChange: (value:number) => void;
  onRightChange: (value:number) => void;
}

type LayoutMeasurements = {
  clientToContainerOffsetX: number;
  paddingWidth: number;
  containerWidth: number;
  thumbWidth: number;
  travelWidth: number;
}

type ThumbConstraint = {
  minX: number;
  maxX: number;
}

function _initLayoutMeasurements():LayoutMeasurements {
  return { clientToContainerOffsetX:0, containerWidth: 0, paddingWidth:0, thumbWidth: 0, travelWidth: 0};
}

function _initThumbConstraints():ThumbConstraint {
  return { minX: 0, maxX: 0 };
}

function _calcLayoutMeasurements(container:HTMLDivElement, thumb:HTMLSpanElement):LayoutMeasurements {
  const thumbWidth = thumb.clientWidth;
  const containerWidth = container.clientWidth;
  const paddingWidth = Math.round(thumbWidth * .7);
  const travelWidth = containerWidth - (paddingWidth*2);
  return { 
    containerWidth, thumbWidth, travelWidth, paddingWidth,
    clientToContainerOffsetX: container.getBoundingClientRect().left,
  };
}

function _calcLeftThumbConstraint(rightThumbPos:number, layoutMeasurements:LayoutMeasurements):ThumbConstraint {
  const {paddingWidth, thumbWidth} = layoutMeasurements;
  return { minX:paddingWidth, maxX:rightThumbPos - thumbWidth + Math.round(thumbWidth / 2) };
}

function _calcRightThumbConstraint(leftThumbPos:number, layoutMeasurements:LayoutMeasurements):ThumbConstraint {
  const {containerWidth, paddingWidth, thumbWidth} = layoutMeasurements;
  return { minX:leftThumbPos + thumbWidth + Math.round(thumbWidth / 2), maxX:containerWidth - paddingWidth };
}

function _calcThumbPosFromValue(value:number, layoutMeasurements:LayoutMeasurements):number {
  const {paddingWidth, travelWidth, thumbWidth} = layoutMeasurements;
  return paddingWidth + ((value/100) * travelWidth) - (thumbWidth/2);
}

function _calcThumbPosFromDragX(dragX:number, thumbWidth:number, thumbConstraint:ThumbConstraint):number {
  const {minX, maxX} = thumbConstraint;
  return clamp(dragX, minX, maxX) - (thumbWidth/2);
}
function _calcValueFromThumbPos(thumbPos:number, layoutMeasurements:LayoutMeasurements):number {
  const {thumbWidth, travelWidth, paddingWidth} = layoutMeasurements;
  const ratio = (thumbPos + (thumbWidth/2) - paddingWidth) / travelWidth;
  return Math.round(ratio * 100);
}

function TrimSlider(props:IProps) {
  const {leftValue, rightValue, onLeftChange, onRightChange} = props;

  const [leftThumbPos, setLeftThumbPos] = useState<number>(0);
  const [rightThumbPos, setRightThumbPos] = useState<number>(0);
  const [isLeftDragging, setIsLeftDragging] = useState<boolean>(false);
  const [isRightDragging, setIsRightDragging] = useState<boolean>(false);
  const [layoutMeasurements, setLayoutMeasurements] = useState<LayoutMeasurements>(_initLayoutMeasurements());
  const [leftThumbConstraint, setLeftThumbConstraint] = useState<ThumbConstraint>(_initThumbConstraints());
  const [rightThumbConstraint, setRightThumbConstraint] = useState<ThumbConstraint>(_initThumbConstraints());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const leftThumbRef = useRef<HTMLSpanElement>(null);
  const rightThumbRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => { // Handle layout measurements
    const container:HTMLDivElement|null = containerRef?.current;
    const leftThumb:HTMLSpanElement|null = leftThumbRef?.current;
    if (!container || !leftThumb) return;
    const _refreshLayoutMeasurements = () => setLayoutMeasurements(_calcLayoutMeasurements(container, leftThumb));
    window.addEventListener('resize', _refreshLayoutMeasurements, false);
    
    _refreshLayoutMeasurements();

    return () => window.removeEventListener('resize', _refreshLayoutMeasurements, false);
  }, [setLayoutMeasurements]);
  
  useEffect(() => { // Handle mouseup events
    const _onMouseUp = () => { setIsLeftDragging(false); setIsRightDragging(false); };
    window.addEventListener('mouseup', _onMouseUp, false);
    return () => {
      window.removeEventListener('mouseup', _onMouseUp, false);
    }
  }, [setIsLeftDragging, setIsRightDragging]);
  
  useEffect(() => {
    setRightThumbConstraint(_calcRightThumbConstraint(leftThumbPos, layoutMeasurements));
  }, [leftThumbPos, layoutMeasurements, setRightThumbConstraint]);

  useEffect(() => {
    setLeftThumbConstraint(_calcLeftThumbConstraint(rightThumbPos, layoutMeasurements));
  }, [rightThumbPos, layoutMeasurements, setLeftThumbConstraint]);
  
  useEffect(() => {
    setLeftThumbPos(_calcThumbPosFromValue(leftValue, layoutMeasurements));
  }, [leftValue, layoutMeasurements, setLeftThumbPos]);

  useEffect(() => {
    setRightThumbPos(_calcThumbPosFromValue(rightValue, layoutMeasurements));
  }, [rightValue, layoutMeasurements, setRightThumbPos]);
  
  return (
    <div 
      className={styles.container}
      onMouseMoveCapture={(event) => {
        const dragX = event.nativeEvent.clientX - layoutMeasurements.clientToContainerOffsetX;
        if (isLeftDragging) {
          const nextLeftThumbPos = _calcThumbPosFromDragX(dragX, layoutMeasurements.thumbWidth, leftThumbConstraint);
          onLeftChange(_calcValueFromThumbPos(nextLeftThumbPos, layoutMeasurements));
        }
        if (isRightDragging) { 
          const nextRightThumbPos = _calcThumbPosFromDragX(dragX, layoutMeasurements.thumbWidth, rightThumbConstraint);
          onRightChange(_calcValueFromThumbPos(nextRightThumbPos, layoutMeasurements));
        }
      }}
      ref={containerRef}
    >
      <div className={styles.groove} />
      <span
        className={styles.thumb}
        onMouseDown={() => { setIsLeftDragging(true); }}
        style={{left:`${leftThumbPos}px`}}
        ref={leftThumbRef}
      >
        <span className={styles.thumbLabel}>start</span>
      </span>
      <span
        className={styles.thumb}
        onMouseDown={() => { setIsRightDragging(true); }}
        style={{left:`${rightThumbPos - layoutMeasurements.thumbWidth}px`}}
        ref={rightThumbRef}
      >
        <span className={styles.thumbLabel}>end</span>
      </span>
    </div>
  );
}

export default TrimSlider;