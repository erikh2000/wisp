import { samplesToWavBytes } from 'sl-web-audio';
function _combineBuffers(buffers: Float32Array[]): Float32Array {
    if (!buffers.length) return new Float32Array(0);
    let totalLength = 0;
    for (let i = 0; i < buffers.length; i++) {
      totalLength += buffers[i].length;
    }
    const combined = new Float32Array(totalLength);
    let offset = 0;
    for (let i = 0; i < buffers.length; i++) {
      combined.set(buffers[i], offset);
      offset += buffers[i].length;
    }
    return combined;
}

class RecordingBuffer {
    private _buffers: Float32Array[];
    private _sampleRate: number;

    constructor() {
        this._buffers = [];
        this._sampleRate = 0;
    }

    public addSamples(samples: Float32Array): void {
      this._buffers.push(samples);
    }
    
    public clear(): void {
        this._buffers = [];
    }

    public getWavBytes(): Uint8Array {
        const combined = _combineBuffers(this._buffers);
        this._buffers = [combined];
        return samplesToWavBytes(combined, this._sampleRate);
    }
    
    public get sampleRate(): number { return this._sampleRate; }
    public set sampleRate(value: number) { this._sampleRate = value; }
}

export default RecordingBuffer;