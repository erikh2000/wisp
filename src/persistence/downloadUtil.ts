export function downloadBlob(blob:Blob, filename:string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
}
export function downloadBytes(bytes:Uint8Array, filename:string, mimeType:string) {
  const blob = new Blob([bytes], { type: mimeType });
  return downloadBlob(blob, filename);
}