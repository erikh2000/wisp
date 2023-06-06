import TestVoiceType from "./testVoices/TestVoiceType";

import {Emotion, LidLevel} from "sl-web-face";

type FacesScreenSettings = {
  emotion:Emotion,
  lidLevel:LidLevel,
  testVoice:TestVoiceType
};

export default FacesScreenSettings;