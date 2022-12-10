import IWaveformAmplitudeMarker from "ui/waveformVisualizer/WaveformAmplitudeMarker";
import IWaveformBlockMarker from "ui/waveformVisualizer/WaveformBlockMarker";
import IWaveformTimeMarker, {MarkerType} from "ui/waveformVisualizer/WaveformTimeMarker";

import {PhonemeTimeline, WordTimeline} from "sl-web-speech";
import {mSecsToSampleCount} from "sl-web-audio";

export type Markers = {
  amplitudeMarkers:IWaveformAmplitudeMarker[],
  blockMarkers:IWaveformBlockMarker[],
  timeMarkers:IWaveformTimeMarker[]
}

export function createEmptyMarkers():Markers {
  return {
    amplitudeMarkers:[],
    blockMarkers:[],
    timeMarkers:[]
  }
}

export function createMarkersFromTimelines(wordTimeline:WordTimeline, phonemeTimeline:PhonemeTimeline, sampleRate:number):Markers {
  const timeMarkers = wordTimeline.map(wordTiming => {
    const description = wordTiming.word;
    const sampleNo = mSecsToSampleCount(wordTiming.startTime, sampleRate);
    const toSampleNo = mSecsToSampleCount(wordTiming.endTime, sampleRate);
    return {
      markerType:MarkerType.Primary,
      sampleNo, toSampleNo, description,
      isBackground:false
    }
  });
  phonemeTimeline.forEach(phonemeTiming => {
    const description = phonemeTiming.phoneme;
    const sampleNo = mSecsToSampleCount(phonemeTiming.time, sampleRate);
    const toSampleNo = sampleNo;
    timeMarkers.push({
      markerType:MarkerType.Secondary,
      sampleNo, toSampleNo, description,
      isBackground:false
    });
  });
  return { amplitudeMarkers:[], blockMarkers:[], timeMarkers };
}