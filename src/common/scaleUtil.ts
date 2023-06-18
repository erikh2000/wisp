export function scaleDimensionsToFit(width:number, height:number, insideWidth:number, insideHeight:number):[number, number] {
  const scale = Math.min(insideWidth / width, insideHeight / height);
  return [width * scale, height * scale];
}

export function scaleDimensionsToCover(width:number, height:number, insideWidth:number, insideHeight:number):[number, number] {
  const scale = Math.max(insideWidth / width, insideHeight / height);
  return [width * scale, height * scale];
}