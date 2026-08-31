// Type-only: checked by `tsc`, never executed
import Compressor, { type Options } from 'compressorjs-next';

new Compressor(new File([], 'test.jpg'), {
  strict: true,
  retainExif: true,
  maxWidth: 1000,
  maxHeight: 1000,
  minWidth: 0,
  minHeight: 0,
  width: 800,
  height: 600,
  resize: 'cover',
  quality: 0.8,
  mimeType: 'image/webp',
  convertTypes: ['image/png'],
  convertSize: 5000000,
  beforeDraw(context, canvas) {
    context.fillRect(0, 0, canvas.width, canvas.height);
  },
  drew(context, canvas) {
    context.fillRect(0, 0, canvas.width, canvas.height);
  },
  success(result) {
    console.log(result.size);
  },
  error(err) {
    console.log(err.message);
  },
});

// A Blob is accepted, and options are optional
new Compressor(new Blob()).abort();

Compressor.setDefaults({ quality: 0.6 });

// Both spellings of the options type must keep resolving
declare const viaNamed: Options;
declare const viaNamespace: Compressor.Options;
declare const convertTypesAsString: Options['convertTypes'];

// @ts-expect-error - `resize` accepts only the three documented values
const badResize: Options = { resize: 'stretch' };

// @ts-expect-error - `quality` is a number
const badQuality: Options = { quality: '0.8' };

// @ts-expect-error - the constructor requires a file
new Compressor();

export { viaNamed, viaNamespace, convertTypesAsString, badResize, badQuality };
