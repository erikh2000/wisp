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
  containerWidth: number;
  thumbWidth: number;
  travelWidth: number;
  leftMinX: number;
  leftMaxX: number;
  rightMinX: number;
  rightMaxX: number;
}

function _initLayoutMeasurements():LayoutMeasurements {
  return { clientToContainerOffsetX:0, containerWidth: 0, thumbWidth: 0, travelWidth: 0, leftMinX: 0, leftMaxX: 0, rightMinX:0, rightMaxX:0 };
}

function _calcLayoutMeasurements(container:HTMLDivElement, thumb:HTMLSpanElement):LayoutMeasurements {
  const thumbWidth = thumb.clientWidth;
  const containerWidth = container.clientWidth;
  const paddingWidth = Math.round(thumbWidth * .7);
  const travelWidth = containerWidth - (paddingWidth*2);
  return { 
    containerWidth, thumbWidth, travelWidth,
    clientToContainerOffsetX: container.getBoundingClientRect().left,  
    leftMinX: paddingWidth, 
    leftMaxX: containerWidth - paddingWidth - thumbWidth,
    rightMinX: paddingWidth + thumbWidth, 
    rightMaxX: containerWidth - paddingWidth
  };
}

function _constrainLeftThumbTravelInLayoutMeasurements(rightThumbPos:number, layoutMeasurements:LayoutMeasurements):LayoutMeasurements {
  const {thumbWidth} = layoutMeasurements;
  const nextLayoutMeasurements = {...layoutMeasurements};
  nextLayoutMeasurements.leftMaxX = rightThumbPos - thumbWidth + Math.round(thumbWidth / 2);
  return nextLayoutMeasurements;
}

function _constrainRightThumbTravelInLayoutMeasurements(leftThumbPos:number, layoutMeasurements:LayoutMeasurements):LayoutMeasurements {
  const {thumbWidth} = layoutMeasurements;
  const nextLayoutMeasurements = {...layoutMeasurements};
  nextLayoutMeasurements.rightMinX = leftThumbPos + thumbWidth + Math.round(thumbWidth / 2);
  return nextLayoutMeasurements;
}

function _calcThumbPosFromValue(value:number, layoutMeasurements:LayoutMeasurements):number {
  const {leftMinX, travelWidth, thumbWidth} = layoutMeasurements;
  return leftMinX + ((value/100) * travelWidth) - (thumbWidth/2);
}

function _calcLeftThumbPosFromDragX(dragX:number, layoutMeasurements:LayoutMeasurements):number {
  const {leftMinX, leftMaxX, thumbWidth} = layoutMeasurements;
  return clamp(dragX, leftMinX, leftMaxX) - (thumbWidth/2);
}

function _calcRightThumbPosFromDragX(dragX:number, layoutMeasurements:LayoutMeasurements):number {
  const {rightMinX, rightMaxX, thumbWidth} = layoutMeasurements;
  return clamp(dragX, rightMinX, rightMaxX) - (thumbWidth/2);
}

function _calcValueFromThumbPos(thumbPos:number, layoutMeasurements:LayoutMeasurements):number {
  const {leftMinX, rightMaxX, thumbWidth, travelWidth} = layoutMeasurements;
  const ratio = (clamp(thumbPos + (thumbWidth/2), leftMinX, rightMaxX) - leftMinX) / travelWidth;
  return Math.round(ratio * 100);
}

function _updateLayoutMeasurementsAndThumbPositions(container:HTMLDivElement, leftThumb:HTMLSpanElement, leftValue:number, rightValue:number, setLayoutMeasurements:Function, setLeftThumbPos:Function, setRightThumbPos:Function) {
  const nextLayoutMeasurements = _calcLayoutMeasurements(container, leftThumb);
  const leftThumbPos = _calcThumbPosFromValue(leftValue, nextLayoutMeasurements);
  const rightThumbPos = _calcThumbPosFromValue(rightValue, nextLayoutMeasurements);
  setLayoutMeasurements(nextLayoutMeasurements);
  setLeftThumbPos(leftThumbPos);
  setRightThumbPos(rightThumbPos);
}

function TrimSlider(props:IProps) {
  const {leftValue, rightValue, onLeftChange, onRightChange} = props;

  const [leftThumbPos, setLeftThumbPos] = useState<number>(0);
  const [rightThumbPos, setRightThumbPos] = useState<number>(0);
  const [isLeftDragging, setIsLeftDragging] = useState<boolean>(false);
  const [wasLeftDragging, setWasLeftDragging] = useState<boolean>(false);
  const [isRightDragging, setIsRightDragging] = useState<boolean>(false);
  const [wasRightDragging, setWasRightDragging] = useState<boolean>(false);

  const [layoutMeasurements, setLayoutMeasurements] = useState<LayoutMeasurements>(_initLayoutMeasurements());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const leftThumbRef = useRef<HTMLSpanElement>(null);
  const rightThumbRef = useRef<HTMLSpanElement>(null);

  useEffect(() => { // Handle mount.
    const container:HTMLDivElement|null = containerRef?.current;
    const leftThumb:HTMLSpanElement|null = leftThumbRef?.current;
    const rightThumb:HTMLSpanElement|null = rightThumbRef?.current;
    if (!container || !leftThumb || !rightThumb) return;
    _updateLayoutMeasurementsAndThumbPositions(container, leftThumb, leftValue, rightValue, setLayoutMeasurements, setLeftThumbPos, setRightThumbPos);

    const _onResize = () => _updateLayoutMeasurementsAndThumbPositions(container, leftThumb, leftValue, rightValue, setLayoutMeasurements, setLeftThumbPos, setRightThumbPos);
    const _onMouseUp = () => { setIsLeftDragging(false); setIsRightDragging(false); };

    window.addEventListener('resize', _onResize, false);
    window.addEventListener('mouseup', _onMouseUp, false);

    return () => {
      window.removeEventListener('resize', _onResize, false);
      window.removeEventListener('mouseup', _onMouseUp, false);
    }
  }, [setLeftThumbPos, setRightThumbPos, setLayoutMeasurements, leftValue, rightValue]);

  useEffect(() => {
    if (isLeftDragging === wasLeftDragging) return;
    if (!isLeftDragging) {
      onLeftChange(_calcValueFromThumbPos(leftThumbPos, layoutMeasurements));
      setLayoutMeasurements(_constrainRightThumbTravelInLayoutMeasurements(leftThumbPos, layoutMeasurements));
    }
    setWasLeftDragging(isLeftDragging);
  }, [leftThumbPos, rightThumbPos, isLeftDragging, wasLeftDragging, layoutMeasurements, setLayoutMeasurements]);

  useEffect(() => {
    if (isRightDragging === wasRightDragging) return;
    if (!isRightDragging) {
      onRightChange(_calcValueFromThumbPos(rightThumbPos, layoutMeasurements));
      setLayoutMeasurements(_constrainLeftThumbTravelInLayoutMeasurements(rightThumbPos, layoutMeasurements));
    }
    setWasRightDragging(isRightDragging);
  }, [leftThumbPos, rightThumbPos, isRightDragging, wasRightDragging, layoutMeasurements, setLayoutMeasurements]);
  
  return (
    <div 
      className={styles.container}
      onMouseMoveCapture={(event) => {
        const dragX = event.nativeEvent.clientX - layoutMeasurements.clientToContainerOffsetX;
        if (isLeftDragging) { setLeftThumbPos(_calcLeftThumbPosFromDragX(dragX, layoutMeasurements)); }
        if (isRightDragging) { setRightThumbPos(_calcRightThumbPosFromDragX(dragX, layoutMeasurements)); }
      }}
      ref={containerRef}
    >
      <div className={styles.groove} />
      <span
        className={styles.thumb}
        onMouseDown={() => { setIsLeftDragging(true); }}
        style={{left:`${leftThumbPos}px`}}
        ref={leftThumbRef}
      />
      <span
        className={styles.thumb}
        onMouseDown={() => { setIsRightDragging(true); }}
        style={{left:`${rightThumbPos - layoutMeasurements.thumbWidth}px`}}
        ref={rightThumbRef}
      />
    </div>
  );
}

export default TrimSlider;