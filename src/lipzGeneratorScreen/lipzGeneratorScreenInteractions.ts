import RevisionManager from "documents/RevisionManager";
import {Markers, createEmptyMarkers, createMarkersFromTimelines} from "lipzGeneratorScreen/markerGeneration";
import {CanvasComponent, loadComponentFromPartUrl, SpeechAudio} from "sl-web-face";
import {
  generateLipzTextFromAudioBuffer,
  init as initWebSpeech,
  wavToLipzTextFilename
} from "sl-web-speech";
import {loadWavFromFileSystem, mSecsToSampleCount} from "sl-web-audio";

let _isInitialized = false;
let mouth:CanvasComponent|null = null;
let speechAudio:SpeechAudio|null = null;
let audioBuffer:AudioBuffer|null = null;

async function onPersistRevision(revision:Revision):Promise<void> {
  // TODO
}

const revisionManager = new RevisionManager<Revision>(onPersistRevision);

export type Revision = {
  lipzText:string|null,
  markers:Markers,
  samples:Float32Array|null,
  lipzSuggestedFilename:string
}

export function getRevisionForMount():Revision {
  let revision = revisionManager.currentRevision;
  if (revision) return revision;
  revision = {
    lipzSuggestedFilename: '',
    lipzText: null,
    markers: createEmptyMarkers(),
    samples: null
  };
  revisionManager.add(revision);
  return revision;
}

export async function init():Promise<void> {
  if (_isInitialized) return;
  mouth = await loadComponentFromPartUrl('/parts/billy-mouth.yml');
  await initWebSpeech();
  _isInitialized = true;
  return;
}

export function isInitialized():boolean { return _isInitialized; }

function _addRevisionChanges(changes:any, setRevision:any) {
  revisionManager.addChanges(changes);
  const nextRevision = revisionManager.currentRevision;
  if (!nextRevision) return;
  setRevision(nextRevision);
}

export async function openWav(setRevision:any, setIsLoadingWav:any) {
  const wavFileData = await loadWavFromFileSystem();
  if (!wavFileData) return;
  const { filename } = wavFileData;
  audioBuffer = wavFileData.audioBuffer;
  if (!audioBuffer) return;

  setIsLoadingWav(true);
  try {
    const debugCapture:any = {};
    const lipzText = await generateLipzTextFromAudioBuffer(audioBuffer, debugCapture);
    speechAudio = new SpeechAudio(audioBuffer, lipzText);
    const lipzSuggestedFilename = wavToLipzTextFilename(filename);
    const sampleRate = audioBuffer.sampleRate;
    const { wordTimeline, phonemeTimeline } = debugCapture;
    
    const nextRevision:Revision = {
      lipzText,
      markers:createMarkersFromTimelines(wordTimeline, phonemeTimeline, sampleRate),
      samples:audioBuffer.getChannelData(0),
      lipzSuggestedFilename
    }
    revisionManager.clear();
    revisionManager.add(nextRevision);
    setRevision(nextRevision);
  } catch(err) {
    throw err;
  } finally {
    setIsLoadingWav(false);
  }
}

export function changeLipzText(lipzText:string, setRevision:any) {
  if (audioBuffer) speechAudio = new SpeechAudio(audioBuffer, lipzText);
  _addRevisionChanges({lipzText}, setRevision);
}

export async function saveLipz(lipzText:string, suggestedFilename:string):Promise<void> {
  try {
    const saveFileOptions = {
      suggestedName:suggestedFilename,
      excludeAcceptAllOption: true,
      multiple:false,
      types: [{
        description: 'Lipz Files',
        accept: {'text/plain': ['.lipz.txt']}
      }]
    };
    const fileHandle:FileSystemFileHandle = await (window as any).showSaveFilePicker(saveFileOptions);
    const writable = await (fileHandle as any).createWritable();
    await writable.write(lipzText);
    return writable.close();
  } catch(err) {
    console.error(err);
  }
}

export function onDrawMouth(context:CanvasRenderingContext2D) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  if (!mouth) return;
  mouth.render(context);
}

let updateNeedleTimeout:NodeJS.Timeout|null = null;
const UPDATE_NEEDLE_INTERVAL = 1000 / 40;

export function onMouthClick(setNeedleSampleNo:any) {
  if (!speechAudio || !audioBuffer) return;
  speechAudio.play();
  if (updateNeedleTimeout) clearTimeout(updateNeedleTimeout);
  
  const playStartTime = Date.now();
  const sampleRate = audioBuffer.sampleRate; 
  
  function _onUpdateNeedle() {
    if (!speechAudio || !speechAudio.isPlaying) {
      setNeedleSampleNo(null);
      return;
    }
    const elapsed = Date.now() - playStartTime;
    const needleSampleNo = mSecsToSampleCount(elapsed, sampleRate);
    setNeedleSampleNo(needleSampleNo);
    updateNeedleTimeout = setTimeout(_onUpdateNeedle, UPDATE_NEEDLE_INTERVAL);
  }
  
  _onUpdateNeedle();
}

export function undo(setRevision:any) {
  const nextRevision = revisionManager.prev();
  if (!nextRevision) return;
  setRevision(nextRevision);
}

export function redo(setRevision:any) {
  const nextRevision = revisionManager.next();
  if (!nextRevision) return;
  setRevision(nextRevision);
}