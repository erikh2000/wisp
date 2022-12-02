import IWaveformAmplitudeMarker from './WaveformAmplitudeMarker';
import IWaveformBlockMarker from "./WaveformBlockMarker";
import IWaveformTimeMarker, { MarkerType } from './WaveformTimeMarker';
import Canvas from '../Canvas';

import React from 'react';

interface IProps {
  amplitudeMarkers:IWaveformAmplitudeMarker[],
  beginSampleNo:number,
  blockMarkers:IWaveformBlockMarker[],
  className:string,
  endSampleNo:number,
  samples:Float32Array|null,
  timeMarkers:IWaveformTimeMarker[]
}

const BG_STYLE = 'rgb(220, 220, 220)';
const ZERO_LINE_STYLE = 'rgb(200, 200, 200)';
const BLOCK_MARKER_STYLE = 'rgb(150,130,130)';
const BORDER_LINE_STYLE = 'rgb(200, 200, 200)';
const BORDER_WIDTH = 4;
const BORDER_HEIGHT = 4;
const SAMPLE_STYLE = 'rgb(0, 40, 0)';
const AMPLITUDE_MARKER_STYLE = 'rgb(160, 80, 80)';
const PRIMARY_MARKER_STYLE = 'rgb(160, 80, 80)';
const SECONDARY_MARKER_STYLE = 'rgb(255, 180, 180)';
const DESCRIPTION_LEFT_MARGIN = 3, DESCRIPTION_TOP_MARGIN = 10;

function _drawBackground(context:CanvasRenderingContext2D) {
  context.fillStyle = BG_STYLE;
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  context.strokeStyle = ZERO_LINE_STYLE;
  context.beginPath();
  context.moveTo(0, context.canvas.height / 2);
  context.lineTo(context.canvas.width, context.canvas.height / 2);
  context.stroke();
  context.strokeStyle = BORDER_LINE_STYLE;
  context.strokeRect(0, 0, context.canvas.width, context.canvas.height);
}

const _drawSamples = (context:CanvasRenderingContext2D, samples:Float32Array, beginSampleNo:number, endSampleNo:number) => {
  const middleY = context.canvas.height / 2;
  const innerHeight = context.canvas.height - (BORDER_WIDTH * 2);
  const innerHeightHalf = innerHeight / 2;
  const innerWidth = context.canvas.width - (BORDER_WIDTH * 2);
  const includedSampleCount = endSampleNo - beginSampleNo;
  context.strokeStyle = SAMPLE_STYLE;
  context.beginPath();
  context.moveTo(BORDER_WIDTH, middleY);
  for(let i = beginSampleNo; i < endSampleNo; ++i) {
    const sample = samples[i];
    const completeRatio = (i - beginSampleNo) / includedSampleCount;
    const x = BORDER_WIDTH + (completeRatio * innerWidth);
    const y = middleY + (-sample * innerHeightHalf);
    context.lineTo(x, y);
  }
  context.stroke();
}

const _drawAmplitudeMarkers = (context:CanvasRenderingContext2D, markers:IWaveformAmplitudeMarker[], isBackground:boolean) => {
  const leftX = BORDER_WIDTH, rightX = context.canvas.width - BORDER_WIDTH;
  const middleY = context.canvas.height / 2;
  const innerHeight = context.canvas.height - (BORDER_WIDTH * 2);
  const innerHeightHalf = innerHeight / 2;

  context.strokeStyle = AMPLITUDE_MARKER_STYLE;

  const amplitudeToY = (amplitude:number) => middleY + (-amplitude * innerHeightHalf);

  markers.forEach(marker => {
    if (marker.isBackground === isBackground) {
      const y = amplitudeToY(marker.amplitude);
      context.beginPath();
      context.moveTo(leftX, y);
      context.lineTo(rightX, y);
      context.stroke();
    }
  });
}

const _drawTimeMarkersOfType = (context:CanvasRenderingContext2D, markers:IWaveformTimeMarker[], beginSampleNo:number,
                                endSampleNo:number, markerType:string, isBackground:boolean) => {
  const RANGE_SERIF_HEIGHT = 10;
  const topY = BORDER_HEIGHT, bottomY = context.canvas.height - BORDER_HEIGHT;
  const innerWidth = context.canvas.width - (BORDER_WIDTH * 2);
  context.strokeStyle = markerType === MarkerType.Primary ? PRIMARY_MARKER_STYLE : SECONDARY_MARKER_STYLE;
  context.font = '15px san-serif';
  context.fillStyle = 'rgb(0,0,0)';
  const includedSampleCount = endSampleNo - beginSampleNo;

  const sampleNoToX = (sampleNo:number) => BORDER_WIDTH + ((sampleNo - beginSampleNo) / includedSampleCount) * innerWidth;

  markers.forEach(marker => {
    if (marker.isBackground === isBackground && marker.markerType === markerType && marker.sampleNo >= beginSampleNo && marker.sampleNo < endSampleNo) {
      const x = sampleNoToX(marker.sampleNo);
      context.beginPath();
      context.moveTo(x, bottomY);
      context.lineTo(x, topY);
      if (marker.toSampleNo) {
        const rangeEndX = sampleNoToX(marker.toSampleNo);
        context.lineTo(rangeEndX, topY);
        context.lineTo(rangeEndX, topY + RANGE_SERIF_HEIGHT);
      }
      context.stroke();
      if (marker.description) context.fillText(marker.description, x+DESCRIPTION_LEFT_MARGIN, topY+DESCRIPTION_TOP_MARGIN);
    }
  });
}

const _drawBlockMarkers = (context:CanvasRenderingContext2D, markers:IWaveformBlockMarker[], beginSampleNo:number,
                           endSampleNo:number, isBackground:boolean) => {
  const middleY = context.canvas.height / 2;
  const innerHeight = context.canvas.height - (BORDER_WIDTH * 2);
  const innerHeightHalf = innerHeight / 2;
  const innerWidth = context.canvas.width - (BORDER_WIDTH * 2);
  context.fillStyle = BLOCK_MARKER_STYLE;
  const includedSampleCount = endSampleNo - beginSampleNo;

  const amplitudeToY = (amplitude:number) => middleY + (-amplitude * innerHeightHalf);
  const sampleNoToX = (sampleNo:number) => BORDER_WIDTH + ((sampleNo - beginSampleNo) / includedSampleCount) * innerWidth;

  markers.forEach(marker => {
    if (marker.isBackground === isBackground && marker.sampleNo >= beginSampleNo && marker.sampleNo < endSampleNo) {
      const x = sampleNoToX(marker.sampleNo);
      const w = (sampleNoToX(marker.toSampleNo) - x);
      const y = amplitudeToY(marker.amplitude);
      const h = (amplitudeToY(marker.toAmplitude) - y);
      context.fillRect(x, y, w, h);
    }
  });
}

const _drawMarkers = (
  context:CanvasRenderingContext2D, amplitudeMarkers:IWaveformAmplitudeMarker[], blockMarkers:IWaveformBlockMarker[],
  timeMarkers:IWaveformTimeMarker[], beginSampleNo:number, endSampleNo:number, isBackground:boolean) => {
  _drawBlockMarkers(context, blockMarkers, beginSampleNo, endSampleNo, isBackground);
  _drawAmplitudeMarkers(context, amplitudeMarkers, isBackground);
  _drawTimeMarkersOfType(context, timeMarkers, beginSampleNo, endSampleNo, MarkerType.Secondary, isBackground);
  _drawTimeMarkersOfType(context, timeMarkers, beginSampleNo, endSampleNo, MarkerType.Primary, isBackground);
}

const WaveformVisualizer = (props:IProps) => {
  const {amplitudeMarkers, blockMarkers, className, samples, beginSampleNo, endSampleNo, timeMarkers} = props;

  const _onDraw = (context:CanvasRenderingContext2D) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    _drawBackground(context);
    _drawMarkers(context, amplitudeMarkers, blockMarkers, timeMarkers, beginSampleNo, endSampleNo, true);
    if (samples) _drawSamples(context, samples, beginSampleNo, endSampleNo);
    _drawMarkers(context, amplitudeMarkers, blockMarkers, timeMarkers, beginSampleNo, endSampleNo, false);
  }

  return <Canvas className={className} isAnimated={false} onDraw={_onDraw} />;
}

export default WaveformVisualizer;