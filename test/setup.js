// Test setup for Vitest browser mode
import Compressor from '../src/index.js';
import * as utilities from '../src/utilities.js';

// Export for use in tests
export { Compressor, utilities };

// Image path for tests (served from project root in Vitest browser mode)
export const TEST_IMAGE = '/docs/media/test.jpg';
export const TEST_IMAGE_PNG = '/docs/media/test.png';

/**
 * Load an image as a Blob for testing
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
    xhr.onerror = () => reject(new Error(`Failed to load ${url}`));
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
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}
