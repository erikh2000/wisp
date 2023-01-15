import TestVoices, {PerEmotionSpeech, PerVoiceSpeech} from "facesScreen/testVoices/TestVoices";
import TestVoiceManifest, {PerVoiceManifest} from "facesScreen/testVoices/TestVoiceManifest";

import {parse} from "yaml";
import {loadSpeechFromUrl} from "sl-web-face";

async function _loadManifest(manifestUrl:string):Promise<TestVoiceManifest> {
  const response = await fetch(manifestUrl);
  if (response.status !== 200 && response.status !== 304) throw Error(`Failed to fetch test voice manifest - HTTP status ${response.status}.`);
  const text = await response.text();
  const object:any = parse(text);
  return object as TestVoiceManifest;
}

function _loadPerEmotionSpeech(waveUrls:string[]):PerEmotionSpeech {
  const perEmotionSpeech:PerEmotionSpeech = {
    variations:[],
    nextVariationNo:0
  };
  waveUrls.forEach((waveUrl, variationI) => {
    loadSpeechFromUrl(waveUrl).then((speechAudio) => {
      // Useful to uncomment the line below if console warnings appear about invalid phonemes.
      // console.log('finished loading waveUrl ' + waveUrl); 
      perEmotionSpeech.variations[variationI] = speechAudio;
    });
  });
  return perEmotionSpeech; // Speech audio will load asynchronously after return.
}

function _loadPerVoiceSpeech(perVoiceManifest:PerVoiceManifest):PerVoiceSpeech {
  return [
    _loadPerEmotionSpeech(perVoiceManifest.neutral),
    _loadPerEmotionSpeech(perVoiceManifest.confused),
    _loadPerEmotionSpeech(perVoiceManifest.sad),
    _loadPerEmotionSpeech(perVoiceManifest.afraid),
    _loadPerEmotionSpeech(perVoiceManifest.evil),
    _loadPerEmotionSpeech(perVoiceManifest.suspicious),
    _loadPerEmotionSpeech(perVoiceManifest.amused),
    _loadPerEmotionSpeech(perVoiceManifest.happy),
    _loadPerEmotionSpeech(perVoiceManifest.thinking),
    _loadPerEmotionSpeech(perVoiceManifest.angry),
    _loadPerEmotionSpeech(perVoiceManifest.irritated)
  ];
}

function _loadTestVoicesFromManifest(manifest:TestVoiceManifest):TestVoices {
  const maleVoiceSpeech:PerVoiceSpeech = _loadPerVoiceSpeech(manifest.male);
  const femaleVoiceSpeech:PerVoiceSpeech = _loadPerVoiceSpeech(manifest.female);
  const perVoiceSpeech:PerVoiceSpeech[] = [maleVoiceSpeech, femaleVoiceSpeech];
  return new TestVoices(perVoiceSpeech);
}

class TestVoiceLoader {
  async loadManifest(manifestUrl:string):Promise<TestVoices> {
    const manifest = await _loadManifest(manifestUrl);
    return _loadTestVoicesFromManifest(manifest);
  } 
}

export default TestVoiceLoader;