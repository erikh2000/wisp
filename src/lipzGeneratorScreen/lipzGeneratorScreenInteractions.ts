import {CanvasComponent, loadComponentFromPartUrl, SpeechAudio} from "sl-web-face";
import {generateLipzTextFromAudioBuffer, init as initWebSpeech, wavToLipzTextFilename} from "sl-web-speech";
import {loadWavFromFileSystem, mSecsToSampleCount} from "sl-web-audio";

let _isInitialized = false;
let mouth:CanvasComponent|null = null;
let speechAudio:SpeechAudio|null = null;
let audioBuffer:AudioBuffer|null = null;

export async function init():Promise<void> {
  if (_isInitialized) return;
  mouth = await loadComponentFromPartUrl('/parts/billy-mouth.yml');
  await initWebSpeech();
  _isInitialized = true;
  return;
}

export function isInitialized():boolean { return _isInitialized; }

export async function openWav(setSamples:any, setSampleRate:any, setWordTimeline:any, setPhonemeTimeline:any, setLipzSuggestedFilename:any, setLipzText:any) {
  const wavFileData = await loadWavFromFileSystem();
  if (!wavFileData) return;
  const { filename } = wavFileData;
  audioBuffer = wavFileData.audioBuffer;

  const debugCapture:any = {};
  const lipzText = await generateLipzTextFromAudioBuffer(audioBuffer, debugCapture);
  speechAudio = new SpeechAudio(audioBuffer, lipzText);
  setWordTimeline(debugCapture.wordTimeline);
  setPhonemeTimeline(debugCapture.phonemeTimeline);
  setSamples(audioBuffer.getChannelData(0));
  setSampleRate(audioBuffer.sampleRate);
  setLipzText(lipzText);
  const suggestedLipzTextFilename = wavToLipzTextFilename(filename);
  setLipzSuggestedFilename(suggestedLipzTextFilename);
}

export function changeLipzText(lipzText:string, setLipzText:any) {
  if (audioBuffer) speechAudio = new SpeechAudio(audioBuffer, lipzText);
  setLipzText(lipzText);
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
  mouth.renderWithChildren(context);
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