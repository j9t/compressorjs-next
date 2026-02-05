import { describe, it, expect } from 'vitest';
import { Compressor, loadImageAsBlob, TEST_IMAGE } from '../setup.js';

describe('Compressor', () => {
  it('should be a class (function)', () => {
    expect(Compressor).toBeTypeOf('function');
  });

  it('should throw error when the first argument is not an image File or Blob object', () => {
    return new Promise((resolve) => {
      new Compressor(new Blob(['Hello, World!']), {
        error(err) {
          expect(err.message).toBe('The first argument must be an image File or Blob object.');
          resolve();
        },
      });
    });
  });

  it('should throw error when the first argument is not a valid image File or Blob object', () => {
    return new Promise((resolve) => {
      new Compressor(new Blob(['Hello, World!'], { type: 'image/jpeg' }), {
        error(err) {
          expect(err.message).toBe('Failed to load the image.');
          resolve();
        },
      });
    });
  });

  it('should throw error when failed to read the image with FileReader', async () => {
    const image = await loadImageAsBlob(TEST_IMAGE);

    return new Promise((resolve) => {
      const compressor = new Compressor(image, {
        error(err) {
          expect(err.message).toBe('Failed to read the image with FileReader.');
          resolve();
        },
      });

      compressor.reader.onload = null;
      compressor.reader.onerror();
    });
  });

  it('should throw error when failed to load the image', async () => {
    const image = await loadImageAsBlob(TEST_IMAGE);

    return new Promise((resolve) => {
      const compressor = new Compressor(image, {
        checkOrientation: false,
        error(err) {
          expect(err.message).toBe('Failed to load the image.');
          resolve();
        },
      });

      compressor.image.onload = null;
      compressor.image.onerror();
    });
  });

  it('should work when the `canvas.toBlob` function does not output any blob object', async () => {
    const image = await loadImageAsBlob(TEST_IMAGE);

    return new Promise((resolve) => {
      new Compressor(image, {
        drew(context, canvas) {
          canvas.toBlob = (callback) => {
            callback(null);
          };
        },
        success(result) {
          expect(result).toBe(image);
          resolve();
        },
      });
    });
  });
});
