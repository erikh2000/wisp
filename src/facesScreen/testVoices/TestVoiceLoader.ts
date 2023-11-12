import {fetchYaml, makePublicUrl} from "common/fetchUtil";
import TestVoices, {PerEmotionSpeech, PerVoiceSpeech} from "facesScreen/testVoices/TestVoices";
import TestVoiceManifest, {PerVoiceManifest} from "facesScreen/testVoices/TestVoiceManifest";

import {FaceEventManager, loadSpeechFromUrl} from "sl-web-face";

async function _loadManifest(manifestUrl:string):Promise<TestVoiceManifest> {
  return await fetchYaml(makePublicUrl(manifestUrl)) as TestVoiceManifest;
}

function _loadPerEmotionSpeech(waveUrls:string[]):PerEmotionSpeech {
  const perEmotionSpeech:PerEmotionSpeech = {
    variations:[],
    nextVariationNo:0
  };
  waveUrls.forEach((waveUrl, variationI) => {
    loadSpeechFromUrl(makePublicUrl(waveUrl)).then((speechAudio) => {
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

function _loadTestVoicesFromManifest(manifest:TestVoiceManifest, faceEventManager:FaceEventManager, faceId:number):TestVoices {
  const maleVoiceSpeech:PerVoiceSpeech = _loadPerVoiceSpeech(manifest.male);
  const femaleVoiceSpeech:PerVoiceSpeech = _loadPerVoiceSpeech(manifest.female);
  const perVoiceSpeech:PerVoiceSpeech[] = [maleVoiceSpeech, femaleVoiceSpeech];
  return new TestVoices(perVoiceSpeech, faceEventManager, faceId);
}

class TestVoiceLoader {
  async loadManifest(manifestUrl:string, faceEventManager:FaceEventManager, faceId:number):Promise<TestVoices> {
    const manifest = await _loadManifest(manifestUrl);
    return _loadTestVoicesFromManifest(manifest, faceEventManager, faceId);
  } 
}

export default TestVoiceLoader;