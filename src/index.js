import DEFAULTS from './defaults.js';
import {
  WINDOW,
} from './constants.js';
import {
  getAdjustedSizes,
  imageTypeToExtension,
  isCanvasReliable,
  isImageType,
  isPositiveNumber,
  normalizeDecimalNumber,
  resetOrientation,
  getExif,
  insertExif,
  stripExif,
  uint8ArrayToBlob,
} from './utilities.js';

const { ArrayBuffer, FileReader } = WINDOW;
const URL = WINDOW.URL || WINDOW.webkitURL;
const REGEXP_EXTENSION = /\.\w+$/;

/**
 * Wrap a blob as the output file.
 * @param {Blob} blob - The blob to wrap.
 * @param {string} name - The name of the output file.
 * @param {string} type - The mime type of the output file.
 * @param {number} [lastModified] - The modification time to stamp on the file.
 * @returns {File} The output file.
 */
function toFile(blob, name, type, lastModified = Date.now()) {
  return new File([blob], name, {
    type,
    lastModified,
  });
}

/**
 * Creates a new image compressor.
 * @class
 */
export default class Compressor {
  /**
   * The constructor of Compressor.
   * @param {File|Blob} file - The target image file for compressing.
   * @param {Object} [options] - The options for compressing.
   */
  constructor(file, options) {
    this.file = file;
    this.exif = [];
    this.image = new Image();
    this.options = {
      ...DEFAULTS,
      ...options,
    };
    this.mimeTypeSet = options && options.mimeType && isImageType(options.mimeType);
    this.aborted = false;
    this.canvasFallback = false;
    this.result = null;
    this.url = null;
    this.init();
  }

  init() {
    const { file, options } = this;

    if (!(file instanceof Blob)) {
      this.fail(new Error('The first argument must be a File or Blob object.'));
      return;
    }

    const mimeType = file.type;

    if (!isImageType(mimeType)) {
      this.fail(new Error('The first argument must be an image File or Blob object.'));
      return;
    }

    if (!URL || !FileReader) {
      this.fail(new Error('The current browser does not support image compression.'));
      return;
    }

    if (!ArrayBuffer) {
      options.retainExif = false;
    }

    if (!isCanvasReliable()) {
      // Canvas is unreliable (e.g., Firefox fingerprinting resistance)—
      // bypass canvas to avoid corrupted output
      console.warn('Compressor.js Next: Canvas data is unreliable (e.g., due to browser fingerprinting resistance)—compression, resizing, and format conversion are unavailable');
      this.canvasFallback = true;
      if (mimeType === 'image/jpeg' && !options.retainExif) {
        // Strip EXIF data directly from the binary to preserve privacy
        this.readAsArrayBuffer(file, {
          subject: 'image',
          onData: (arrayBuffer) => {
            let blob;

            try {
              blob = uint8ArrayToBlob(stripExif(arrayBuffer), mimeType);
            } catch {
              this.fail(new Error('Failed to process the image data.'));
              return;
            }

            this.succeed(toFile(blob, file.name || '', mimeType));
          },
        });
      } else {
        // Non-JPEG: No EXIF to strip, return as-is
        // Defer callback to match the normal async flow
        Promise.resolve().then(() => {
          if (this.aborted) return;
          this.succeed(file);
        });
      }

      return;
    }

    const isJPEGImage = mimeType === 'image/jpeg';
    const retainExif = isJPEGImage && options.retainExif;

    if (!retainExif) {
      this.url = URL.createObjectURL(file);
      this.load({
        url: this.url,
      });
    } else {
      this.readAsArrayBuffer(file, {
        subject: 'image',
        onData: (arrayBuffer) => {
          // Normalize EXIF orientation to 1 before extracting, since the browser
          // handles rotation natively via `image-orientation: from-image`
          resetOrientation(arrayBuffer);
          this.exif = getExif(arrayBuffer);
          this.url = URL.createObjectURL(file);
          this.load({
            url: this.url,
          });
        },
      });
    }
  }

  load(data) {
    const { file, image } = this;

    image.onload = () => {
      this.draw({
        ...data,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      });
    };
    image.onabort = () => {
      this.fail(new Error('Aborted to load the image.'));
    };
    image.onerror = () => {
      this.fail(new Error('Failed to load the image.'));
    };

    // Match all browsers that use WebKit as the layout engine in iOS devices,
    // such as Safari for iOS, Chrome for iOS, and in-app browsers
    if (WINDOW.navigator && /(?:iPad|iPhone|iPod).*?AppleWebKit/i.test(WINDOW.navigator.userAgent)) {
      // Fix the `The operation is insecure` error (#57)
      image.crossOrigin = 'anonymous';
    }

    image.alt = file.name;
    image.src = data.url;
  }

  draw({ naturalWidth, naturalHeight }) {
    const { file, image, options } = this;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const resizable = (options.resize === 'contain' || options.resize === 'cover') && isPositiveNumber(options.width) && isPositiveNumber(options.height);
    let maxWidth = Math.max(options.maxWidth, 0) || Infinity;
    let maxHeight = Math.max(options.maxHeight, 0) || Infinity;
    let minWidth = Math.max(options.minWidth, 0) || 0;
    let minHeight = Math.max(options.minHeight, 0) || 0;
    let aspectRatio = naturalWidth / naturalHeight;
    let { width, height } = options;

    if (resizable) {
      aspectRatio = width / height;
    }

    ({ width: maxWidth, height: maxHeight } = getAdjustedSizes({
      aspectRatio,
      width: maxWidth,
      height: maxHeight,
    }, 'contain'));
    ({ width: minWidth, height: minHeight } = getAdjustedSizes({
      aspectRatio,
      width: minWidth,
      height: minHeight,
    }, 'cover'));

    if (resizable) {
      ({ width, height } = getAdjustedSizes({
        aspectRatio,
        width,
        height,
      }, options.resize));
    } else {
      ({ width = naturalWidth, height = naturalHeight } = getAdjustedSizes({
        aspectRatio,
        width,
        height,
      }));
    }

    width = Math.floor(normalizeDecimalNumber(Math.min(Math.max(width, minWidth), maxWidth)));
    height = Math.floor(normalizeDecimalNumber(Math.min(Math.max(height, minHeight), maxHeight)));

    const params = [];

    if (resizable) {
      const { width: srcWidth, height: srcHeight } = getAdjustedSizes({
        aspectRatio,
        width: naturalWidth,
        height: naturalHeight,
      }, {
        contain: 'cover',
        cover: 'contain',
      }[options.resize]);
      const srcX = (naturalWidth - srcWidth) / 2;
      const srcY = (naturalHeight - srcHeight) / 2;

      params.push(srcX, srcY, srcWidth, srcHeight);
    }

    params.push(0, 0, width, height);

    canvas.width = width;
    canvas.height = height;

    if (!isImageType(options.mimeType)) {
      options.mimeType = file.type;
    }

    let fillStyle = 'transparent';

    // Converts files over the `convertSize` to JPEG,
    // unless the user explicitly set a `mimeType`.
    if (!this.mimeTypeSet && file.size > options.convertSize
      && options.convertTypes.indexOf(options.mimeType) >= 0) {
      options.mimeType = 'image/jpeg';
    }

    const isJPEGImage = options.mimeType === 'image/jpeg';

    if (isJPEGImage) {
      fillStyle = '#fff';
    }

    // Override the default fill color (`#000`, black)
    context.fillStyle = fillStyle;
    context.fillRect(0, 0, width, height);

    if (options.beforeDraw) {
      options.beforeDraw.call(this, context, canvas);
    }

    if (this.aborted) {
      return;
    }

    context.drawImage(image, ...params);

    if (options.drew) {
      options.drew.call(this, context, canvas);
    }

    if (this.aborted) {
      return;
    }

    const callback = (blob) => {
      if (!this.aborted) {
        const done = (result) => this.done({
          naturalWidth,
          naturalHeight,
          result,
        });

        if (blob && isJPEGImage && options.retainExif && this.exif && this.exif.length > 0) {
          this.readBlobAsArrayBuffer(blob, (arrayBuffer) => {
            if (this.aborted) return;
            const withExif = insertExif(arrayBuffer, this.exif);
            done(uint8ArrayToBlob(withExif, options.mimeType));
          });
        } else if (blob && isJPEGImage && !options.retainExif) {
          // Strip any EXIF that may be present in the canvas output
          // (most browsers strip it automatically, but WebKit preserves the
          // source EXIF—this ensures consistent, privacy-safe output)
          this.readBlobAsArrayBuffer(blob, (arrayBuffer) => {
            if (this.aborted) return;
            done(uint8ArrayToBlob(stripExif(arrayBuffer), options.mimeType));
          });
        } else {
          done(blob);
        }
      }
    };

    canvas.toBlob(callback, options.mimeType, options.quality);
  }

  done({
    naturalWidth,
    naturalHeight,
    result,
  }) {
    const { file, options } = this;

    this.revokeUrl();

    let strictFallback = false;

    if (result) {
      // Returns original file if the result is greater than it and without size-related options
      if (
        options.strict
        && !options.retainExif
        && result.size > file.size
        && options.mimeType === file.type
        && !(
          options.width > naturalWidth
          || options.height > naturalHeight
          || options.minWidth > naturalWidth
          || options.minHeight > naturalHeight
          || options.maxWidth < naturalWidth
          || options.maxHeight < naturalHeight
        )
      ) {
        result = file;
        strictFallback = true;
      } else {
        let name = file.name || '';

        // Convert the extension to match its type
        if (name && result.type !== file.type) {
          name = name.replace(
            REGEXP_EXTENSION,
            imageTypeToExtension(result.type),
          );
        }

        result = toFile(result, name, result.type);
      }
    } else {
      // Returns original file if the result is null in some cases
      console.warn('Compressor.js Next: Canvas produced no output—returning the original image');
      result = file;
    }

    // When strict returns the original file, it may still contain EXIF—strip it
    // asynchronously so the output is consistently EXIF-free across all browsers
    if (strictFallback && file.type === 'image/jpeg') {
      const succeedStripped = (arrayBuffer) => {
        const strippedBlob = uint8ArrayToBlob(stripExif(arrayBuffer), file.type);

        this.succeed(toFile(
          strippedBlob,
          file.name || '',
          file.type,
          file.lastModified ?? Date.now(),
        ));
      };
      const succeedOriginal = (err) => {
        if (this.aborted) return;

        console.warn(
          `Compressor.js Next: Failed to strip EXIF from original file—returning original with EXIF intact${file.name ? ` [${file.name}]` : ''}${err?.message ? `: ${err.message}` : ''}`,
        );

        this.succeed(file);
      };

      if (file.arrayBuffer) {
        file.arrayBuffer().then((arrayBuffer) => {
          if (this.aborted) return;

          succeedStripped(arrayBuffer);
        }).catch(succeedOriginal);
      } else {
        this.readAsArrayBuffer(file, {
          subject: 'original file',
          onData: succeedStripped,
          onError: () => succeedOriginal(),
        });
      }

      return;
    }

    this.succeed(result);
  }

  /**
   * Read a blob as an array buffer, routing reader failures through `fail()`.
   * @param {Blob} blob - The blob to read.
   * @param {Object} handlers - The read handlers.
   * @param {string} handlers.subject - Names the blob in error messages.
   * @param {Function} handlers.onData - Receives the array buffer.
   * @param {Function} [handlers.onError] - Overrides the default read failure.
   */
  readAsArrayBuffer(blob, { subject, onData, onError }) {
    const reader = new FileReader();

    this.reader = reader;
    reader.onload = ({ target }) => {
      if (this.aborted) return;

      try {
        onData(target.result);
      } catch (err) {
        this.fail(err);
      }
    };
    reader.onabort = () => {
      this.fail(new Error(`Aborted to read the ${subject} with FileReader.`));
    };
    reader.onerror = onError || (() => {
      this.fail(new Error(`Failed to read the ${subject} with FileReader.`));
    });
    reader.onloadend = () => {
      this.reader = null;
    };
    reader.readAsArrayBuffer(blob);
  }

  readBlobAsArrayBuffer(blob, next) {
    if (blob.arrayBuffer) {
      blob.arrayBuffer().then(next).catch(() => {
        // Defer to a macrotask so any `abort()` scheduled via `setTimeout()`
        // in a `drew()` hook has a chance to set `this.aborted` first
        setTimeout(() => {
          if (this.aborted) return;
          this.fail(new Error('Failed to read the compressed image with `Blob.arrayBuffer()`.'));
        }, 0);
      });
    } else {
      this.readAsArrayBuffer(blob, {
        subject: 'compressed image',
        onData: next,
      });
    }
  }

  succeed(result) {
    this.result = result;

    if (this.options.success) {
      this.options.success.call(this, result);
    }
  }

  fail(err) {
    const { options } = this;

    this.revokeUrl();

    if (options.error) {
      options.error.call(this, err);
    } else {
      throw err;
    }
  }

  revokeUrl() {
    if (URL && this.url) {
      URL.revokeObjectURL(this.url);
      this.url = null;
    }
  }

  abort() {
    if (!this.aborted) {
      this.aborted = true;

      if (this.reader) {
        this.reader.abort();
      } else if (!this.image.complete) {
        this.image.onload = null;
        this.image.onerror = null;
        this.image.onabort = null;
        this.fail(new Error('Aborted to load the image.'));
      } else {
        this.fail(new Error('The compression process has been aborted.'));
      }
    }
  }

  /**
   * Change the default options.
   * @param {Object} options - The new default options.
   */
  static setDefaults(options) {
    Object.assign(DEFAULTS, options);
  }
}
