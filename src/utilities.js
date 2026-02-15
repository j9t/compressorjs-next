import {
  WINDOW,
} from './constants';

/**
 * Check if the given value is a positive number.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a positive number, else `false`.
 */
export const isPositiveNumber = (value) => value > 0 && value < Infinity;

const REGEXP_IMAGE_TYPE = /^image\/.+$/;

/**
 * Check if the given value is a mime type of image.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given is a mime type of image, else `false`.
 */
export function isImageType(value) {
  return REGEXP_IMAGE_TYPE.test(value);
}

/**
 * Convert image type to extension.
 * @param {string} value - The image type to convert.
 * @returns {boolean} Returns the image extension.
 */
export function imageTypeToExtension(value) {
  let extension = isImageType(value) ? value.slice(6) : '';

  if (extension === 'jpeg') {
    extension = 'jpg';
  }

  return `.${extension}`;
}

const { fromCharCode } = String;

/**
 * Get string from char code in data view.
 * @param {DataView} dataView - The data view for read.
 * @param {number} start - The start index.
 * @param {number} length - The read length.
 * @returns {string} The read result.
 */
function getStringFromCharCode(dataView, start, length) {
  let str = '';
  let i;

  length += start;

  for (i = start; i < length; i += 1) {
    str += fromCharCode(dataView.getUint8(i));
  }

  return str;
}

const { btoa } = WINDOW;

/**
 * Transform array buffer to Data URL.
 * @param {ArrayBuffer} arrayBuffer - The array buffer to transform.
 * @param {string} mimeType - The mime type of the Data URL.
 * @returns {string} The result Data URL.
 */
export function arrayBufferToDataURL(arrayBuffer, mimeType) {
  const uint8 = new Uint8Array(arrayBuffer);
  const { length } = uint8;
  const chunkSize = 8192;
  let binary = '';

  for (let i = 0; i < length; i += chunkSize) {
    const end = Math.min(i + chunkSize, length);
    let chunk = '';

    for (let j = i; j < end; j += 1) {
      chunk += fromCharCode(uint8[j]);
    }

    binary += chunk;
  }

  return `data:${mimeType};base64,${btoa(binary)}`;
}

/**
 * Get orientation value from given array buffer.
 * @param {ArrayBuffer} arrayBuffer - The array buffer to read.
 * @returns {number} The read orientation value.
 */
export function resetAndGetOrientation(arrayBuffer) {
  const dataView = new DataView(arrayBuffer);
  let orientation;

  // Ignores range error when the image does not have correct Exif information
  try {
    let littleEndian;
    let app1Start;
    let ifdStart;

    // Only handle JPEG image (start by 0xFFD8)
    if (dataView.getUint8(0) === 0xFF && dataView.getUint8(1) === 0xD8) {
      const length = dataView.byteLength;
      let offset = 2;

      while (offset + 1 < length) {
        if (dataView.getUint8(offset) === 0xFF && dataView.getUint8(offset + 1) === 0xE1) {
          app1Start = offset;
          break;
        }

        offset += 1;
      }
    }

    if (app1Start) {
      const exifIDCode = app1Start + 4;
      const tiffOffset = app1Start + 10;

      if (getStringFromCharCode(dataView, exifIDCode, 4) === 'Exif') {
        const endianness = dataView.getUint16(tiffOffset);

        littleEndian = endianness === 0x4949;

        if (littleEndian || endianness === 0x4D4D /* bigEndian */) {
          if (dataView.getUint16(tiffOffset + 2, littleEndian) === 0x002A) {
            const firstIFDOffset = dataView.getUint32(tiffOffset + 4, littleEndian);

            if (firstIFDOffset >= 0x00000008) {
              ifdStart = tiffOffset + firstIFDOffset;
            }
          }
        }
      }
    }

    if (ifdStart) {
      const length = dataView.getUint16(ifdStart, littleEndian);
      let offset;
      let i;

      for (i = 0; i < length; i += 1) {
        offset = ifdStart + (i * 12) + 2;

        if (dataView.getUint16(offset, littleEndian) === 0x0112 /* Orientation */) {
          // 8 is the offset of the current tag's value
          offset += 8;

          // Get the original orientation value
          orientation = dataView.getUint16(offset, littleEndian);

          // Override the orientation with its default value
          dataView.setUint16(offset, 1, littleEndian);
          break;
        }
      }
    }
  } catch {
    orientation = 1;
  }

  return orientation;
}

/**
 * Parse Exif Orientation value.
 * @param {number} orientation - The orientation to parse.
 * @returns {Object} The parsed result.
 */
export function parseOrientation(orientation) {
  let rotate = 0;
  let scaleX = 1;
  let scaleY = 1;

  switch (orientation) {
    // Flip horizontal
    case 2:
      scaleX = -1;
      break;

    // Rotate left 180°
    case 3:
      rotate = -180;
      break;

    // Flip vertical
    case 4:
      scaleY = -1;
      break;

    // Flip vertical and rotate right 90°
    case 5:
      rotate = 90;
      scaleY = -1;
      break;

    // Rotate right 90°
    case 6:
      rotate = 90;
      break;

    // Flip horizontal and rotate right 90°
    case 7:
      rotate = 90;
      scaleX = -1;
      break;

    // Rotate left 90°
    case 8:
      rotate = -90;
      break;

    default:
  }

  return {
    rotate,
    scaleX,
    scaleY,
  };
}

/**
 * Check if the browser’s canvas produces reliable pixel data.
 * Returns `false` when anti-fingerprinting measures (e.g., Firefox’s
 * `privacy.resistFingerprinting`) add noise to canvas output.
 * @returns {boolean} Returns `true` if canvas data is reliable.
 */
export function isCanvasReliable() {
  try {
    const canvas = document.createElement('canvas');

    canvas.width = 4;
    canvas.height = 4;

    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(canvas.width, canvas.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = i;
      imageData.data[i + 1] = 1;
      imageData.data[i + 2] = 2;
      imageData.data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);

    const result = ctx.getImageData(0, 0, canvas.width, canvas.height);

    return result.data.every((value, index) => {
      const channel = index % 4;

      if (channel === 0) return value === (index & 0xFF);
      if (channel === 1) return value === 1;
      if (channel === 2) return value === 2;
      return value === 255;
    });
  } catch {
    return false;
  }
}

/**
 * Strip all APP1 (EXIF) segments from a JPEG array buffer.
 * @param {ArrayBuffer} arrayBuffer - The JPEG data to strip.
 * @returns {Uint8Array} The JPEG data without EXIF segments.
 */
export function stripExif(arrayBuffer) {
  const dataView = new DataView(arrayBuffer);
  const { byteLength } = dataView;
  const pieces = [];
  let start = 0;

  // Only handle JPEG data (starts with SOI marker FF D8)
  if (byteLength < 4
    || dataView.getUint8(0) !== 0xFF
    || dataView.getUint8(1) !== 0xD8) {
    return new Uint8Array(arrayBuffer);
  }

  // Keep SOI marker
  pieces.push(new Uint8Array(arrayBuffer, 0, 2));
  start = 2;

  while (start + 3 < byteLength) {
    const marker = dataView.getUint8(start);
    const type = dataView.getUint8(start + 1);

    if (marker !== 0xFF) break;

    // SOS (Start of Scan)—the rest is image data, keep it all
    if (type === 0xDA) {
      pieces.push(new Uint8Array(arrayBuffer, start));
      break;
    }

    const segmentLength = dataView.getUint16(start + 2);
    const segmentEnd = start + 2 + segmentLength;

    // Skip APP1 (EXIF) segments, keep everything else
    if (type !== 0xE1) {
      pieces.push(new Uint8Array(arrayBuffer, start, segmentEnd - start));
    }

    start = segmentEnd;
  }

  const totalLength = pieces.reduce((sum, piece) => sum + piece.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const piece of pieces) {
    result.set(piece, offset);
    offset += piece.length;
  }

  return result;
}

const REGEXP_DECIMALS = /\.\d*(?:0|9){12}\d*$/;

/**
 * Normalize decimal number.
 * Check out {@link https://0.30000000000000004.com/}
 * @param {number} value - The value to normalize.
 * @param {number} [times=100000000000] - The times for normalizing.
 * @returns {number} Returns the normalized number.
 */
export function normalizeDecimalNumber(value, times = 100000000000) {
  return REGEXP_DECIMALS.test(value) ? (Math.round(value * times) / times) : value;
}

/**
 * Get the max sizes in a rectangle under the given aspect ratio.
 * @param {Object} data - The original sizes.
 * @param {string} [type='contain'] - The adjust type.
 * @returns {Object} The result sizes.
 */
export function getAdjustedSizes(
  {
    aspectRatio,
    height,
    width,
  },

  // `none` | `contain` | `cover`
  type = 'none',
) {
  const isValidWidth = isPositiveNumber(width);
  const isValidHeight = isPositiveNumber(height);

  if (isValidWidth && isValidHeight) {
    const adjustedWidth = height * aspectRatio;

    if (((type === 'contain' || type === 'none') && adjustedWidth > width) || (type === 'cover' && adjustedWidth < width)) {
      height = width / aspectRatio;
    } else {
      width = height * aspectRatio;
    }
  } else if (isValidWidth) {
    height = width / aspectRatio;
  } else if (isValidHeight) {
    width = height * aspectRatio;
  }

  return {
    width,
    height,
  };
}

/**
 * Get Exif information from the given array buffer.
 * @param {ArrayBuffer} arrayBuffer - The array buffer to read.
 * @returns {Array} The read Exif information.
 */
export function getExif(arrayBuffer) {
  const dataView = new DataView(arrayBuffer);
  const { byteLength } = dataView;
  const exifArray = [];
  let start = 0;

  while (start + 3 < byteLength) {
    const value = dataView.getUint8(start);
    const next = dataView.getUint8(start + 1);

    // SOS (Start of Scan)
    if (value === 0xFF && next === 0xDA) {
      break;
    }

    // SOI (Start of Image)
    if (value === 0xFF && next === 0xD8) {
      start += 2;
    } else {
      const segmentLength = dataView.getUint16(start + 2);
      const end = start + segmentLength + 2;

      // APP1 marker (EXIF)
      if (value === 0xFF && next === 0xE1) {
        for (let i = start; i < end && i < byteLength; i += 1) {
          exifArray.push(dataView.getUint8(i));
        }
      }

      start = end;
    }
  }

  return exifArray;
}

/**
 * Insert Exif information into the given array buffer.
 * @param {ArrayBuffer} arrayBuffer - The array buffer to transform.
 * @param {Array} exifArray - The Exif information to insert.
 * @returns {Uint8Array} The transformed array as Uint8Array.
 */
export function insertExif(arrayBuffer, exifArray) {
  const dataView = new DataView(arrayBuffer);
  const uint8 = new Uint8Array(arrayBuffer);

  // Check for APP0 marker (JFIF)
  if (dataView.getUint8(2) !== 0xFF || dataView.getUint8(3) !== 0xE0) {
    return uint8;
  }

  const app0Length = dataView.getUint16(4);
  const restStart = 4 + app0Length;
  const restLength = uint8.byteLength - restStart;

  // Create new buffer: SOI (2) + EXIF + rest of image
  const result = new Uint8Array(2 + exifArray.length + restLength);

  // SOI marker
  result[0] = 0xFF;
  result[1] = 0xD8;

  // EXIF data
  for (let i = 0; i < exifArray.length; i += 1) {
    result[2 + i] = exifArray[i];
  }

  // Rest of image (skip SOI and APP0)
  result.set(uint8.subarray(restStart), 2 + exifArray.length);

  return result;
}

/**
 * Convert a Uint8Array to a Blob.
 * @param {Uint8Array} uint8Array - The Uint8Array to convert.
 * @param {string} mimeType - The mime type of the Blob.
 * @returns {Blob} The resulting Blob.
 */
export function uint8ArrayToBlob(uint8Array, mimeType) {
  return new Blob([uint8Array], { type: mimeType });
}
