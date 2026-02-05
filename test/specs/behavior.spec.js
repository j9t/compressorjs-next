import { describe, it, expect } from 'vitest';
import { Compressor, loadImageAsBlob, compress, utilities, TEST_IMAGE, TEST_IMAGE_PNG } from '../setup.js';

const { getExif } = utilities;

function blobToArrayBuffer(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = ({ target }) => {
      resolve(target.result);
    };
    reader.readAsArrayBuffer(blob);
  });
}

describe('behavior options', () => {
  describe('strict', () => {
    it('should be `true` by default', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const compressor = new Compressor(image);

      expect(compressor.options.strict).toBe(true);
    });

    it('should output the original image as the result', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const { result } = await compress(image, { quality: 1 });

      expect(result).toBe(image);
    });

    it('should be ignored when the `mimeType` option is set and its value is different from the mime type of the image', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const { result } = await compress(image, { mimeType: 'image/png' });

      expect(result).not.toBe(image);
    });

    it('should be ignored when the `width` option is set and its value is greater than the natural width of the image', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const { result } = await compress(image, { width: 501 });

      expect(result).not.toBe(image);
    });

    it('should be ignored when the `height` option is set and its value is greater than the natural height of the image', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const { result } = await compress(image, { height: 601 });

      expect(result).not.toBe(image);
    });

    it('should be ignored when the `minWidth` option is set and its value is greater than the natural width of the image', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const { result } = await compress(image, { minWidth: 501 });

      expect(result).not.toBe(image);
    });

    it('should be ignored when the `minHeight` option is set and its value is greater than the natural height of the image', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const { result } = await compress(image, { minHeight: 601 });

      expect(result).not.toBe(image);
    });

    it('should be ignored when the `maxWidth` option is set and its value is less than the natural width of the image', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const { result } = await compress(image, { maxWidth: 499 });

      expect(result).not.toBe(image);
    });

    it('should be ignored when the `maxHeight` option is set and its value is less than the natural height of the image', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const { result } = await compress(image, { maxHeight: 599 });

      expect(result).not.toBe(image);
    });
  });

  describe('checkOrientation', () => {
    it('should check orientation by default', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);

      return new Promise((resolve) => {
        const compressor = new Compressor(image, {
          success(result) {
            const newImage = new Image();

            newImage.onload = () => {
              expect(newImage.naturalWidth).toBeLessThan(newImage.naturalHeight);
              resolve();
            };
            newImage.src = URL.createObjectURL(result);
          },
        });

        expect(compressor.options.checkOrientation).toBe(true);
      });
    });
  });

  describe('retainExif', () => {
    it('should not retain the Exif information', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const { result } = await compress(image);
      const arrayBuffer = await blobToArrayBuffer(result);

      expect(getExif(arrayBuffer)).toHaveLength(0);
    });

    it('should retain the Exif information', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const { result } = await compress(image, { retainExif: true });
      const arrayBuffer = await blobToArrayBuffer(result);

      expect(getExif(arrayBuffer).length).toBeGreaterThan(0);
    });
  });
});
