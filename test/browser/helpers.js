// Shared helpers for the browser suite
import Compressor from '../../src/index.js';
import * as utilities from '../../src/utilities.js';

export { Compressor, utilities };

// Image path for tests (served from project root in Vitest browser mode)
export const TEST_IMAGE = '/docs/media/test.jpg';
export const TEST_IMAGE_PNG = '/docs/media/test.png';

/**
 * Load an image as a Blob for testing.
 * @param {string} url - The image URL
 * @returns {Promise<Blob>} The image as a Blob
 */
export function loadImageAsBlob(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
      const blob = xhr.response;

      blob.name = url.replace(/^.*?(\w+\.\w+)$/, '$1');
      resolve(blob);
    };
    xhr.onerror = () => reject(new Error(`Failed to load ${url}.`));
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  });
}

/**
 * Compress an image and return a Promise
 * @param {Blob} image - The image to compress
 * @param {Object} options - Compressor options (without success/error)
 * @returns {Promise<{compressor: Compressor, result: Blob}>}
 */
export function compress(image, options = {}) {
  return new Promise((resolve, reject) => {
    const compressor = new Compressor(image, {
      ...options,
      success(result) {
        if (options.success) options.success.call(this, result);
        resolve({ compressor, result });
      },
      error(err) {
        if (options.error) options.error.call(this, err);
        reject(err);
      },
    });
  });
}

/**
 * Get the dimensions of a blob image
 * @param {Blob} blob - The image blob
 * @returns {Promise<{width: number, height: number}>}
 */
export function getImageDimensions(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image.'));
    };
    img.src = url;
  });
}

const ascii = (value) => [...value].map((character) => character.charCodeAt(0));

/**
 * Build a JPEG segment (marker, big-endian length, payload).
 * @param {number} marker - The second marker byte (e.g. `0xE1` for APP1).
 * @param {number[]} payload - The payload bytes, excluding the length itself.
 * @returns {Uint8Array} The encoded segment.
 */
export function jpegSegment(marker, payload) {
  const length = payload.length + 2;

  return Uint8Array.from([0xFF, marker, (length >> 8) & 0xFF, length & 0xFF, ...payload]);
}

/**
 * Build an APP1 EXIF payload carrying a single Orientation tag.
 * @param {number} orientation - The orientation value to store.
 * @returns {number[]} The payload bytes.
 */
export function exifPayload(orientation) {
  return [
    ...ascii('Exif'), 0x00, 0x00,

    // TIFF header, little-endian, IFD0 at offset 8
    0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,

    // One entry: Orientation (0x0112), SHORT, count 1
    0x01, 0x00,
    0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00,
    orientation & 0xFF, 0x00, 0x00, 0x00,

    // No next IFD
    0x00, 0x00, 0x00, 0x00,
  ];
}

/**
 * Build an APP1 XMP payload, as written by many photo editors.
 * @returns {number[]} The payload bytes.
 */
export function xmpPayload() {
  return [...ascii('http://ns.adobe.com/xap/1.0/'), 0x00, ...ascii('<x:xmpmeta/>')];
}

/**
 * Assemble a minimal but well-formed JPEG around the given segments.
 * @param {Uint8Array[]} [segments] - The segments to place between SOI and SOS.
 * @returns {ArrayBuffer} The assembled JPEG.
 */
export function buildJpeg(segments = []) {
  const parts = [
    Uint8Array.from([0xFF, 0xD8]),
    ...segments,
    Uint8Array.from([0xFF, 0xDA, 0x00, 0x08, 0, 0, 0, 0, 0, 0]),
    Uint8Array.from([0x11, 0x22, 0x33, 0x44]),
    Uint8Array.from([0xFF, 0xD9]),
  ];
  const result = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;

  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }

  return result.buffer;
}

/**
 * Read the Orientation tag back out of EXIF bytes returned by `getExif()`.
 * @param {number[]} exifArray - The EXIF bytes to search.
 * @returns {number|null} The orientation value, or `null` when absent.
 */
export function readOrientation(exifArray) {
  const uint8 = Uint8Array.from(exifArray);
  const dataView = new DataView(uint8.buffer);

  for (let i = 0; i + 11 < uint8.length; i += 1) {
    if (dataView.getUint8(i) === 0x12 && dataView.getUint8(i + 1) === 0x01
      && dataView.getUint8(i + 2) === 0x03 && dataView.getUint8(i + 3) === 0x00) {
      return dataView.getUint16(i + 8, true);
    }
  }

  return null;
}
