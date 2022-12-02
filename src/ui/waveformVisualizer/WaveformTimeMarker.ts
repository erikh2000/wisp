export const MarkerType = {
  Primary : "Primary",
  Secondary : "Secondary"
};

interface IWaveformTimeMarker {
  markerType:string,
  sampleNo:number,
  toSampleNo:number|null,
  description:string|null,
  isBackground:boolean
}

export default IWaveformTimeMarker;