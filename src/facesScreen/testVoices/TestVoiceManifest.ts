export type PerVoiceManifest = {
  neutral: string[],
  confused: string[],
  sad: string[],
  afraid: string[],
  evil: string[],
  suspicious: string[],
  amused: string[],
  happy: string[],
  thinking: string[],
  angry: string[],
  irritated: string[]
};
  
type TestVoiceManifest = {
  male: PerVoiceManifest,
  female: PerVoiceManifest
}

export default TestVoiceManifest;