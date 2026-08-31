export interface Options {
  strict?: boolean;
  retainExif?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  width?: number;
  height?: number;
  resize?: 'contain' | 'cover' | 'none';
  quality?: number;
  mimeType?: string;
  convertTypes?: string | string[];
  convertSize?: number;
  beforeDraw?(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void;
  drew?(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void;
  success?(file: File | Blob): void;
  error?(err: Error): void;
}

declare class Compressor {
  constructor(file: File | Blob, options?: Options);
  abort(): void;
  static setDefaults(options: Options): void;
}

// Keeps `Compressor.Options` working alongside the named `Options` export
declare namespace Compressor {
  export { Options };
}

export default Compressor;
