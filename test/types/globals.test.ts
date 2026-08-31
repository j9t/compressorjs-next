// Guards against the package leaking its types into a consumer’s global scope,
// which is what happens when the declaration file is a script rather than a module
import 'compressorjs-next';

// @ts-expect-error - `Compressor` must not exist as a global type
declare const leakedClass: Compressor;

// @ts-expect-error - `Compressor.Options` must not exist as a global type
declare const leakedOptions: Compressor.Options;

export { leakedClass, leakedOptions };
