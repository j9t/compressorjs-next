import { describe, it, expect } from 'vitest';
import { Compressor, loadImageAsBlob, compress, TEST_IMAGE, TEST_IMAGE_PNG } from '../setup.js';

describe('output options', () => {
  describe('mimeType', () => {
    it('should be `auto` by default', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const compressor = new Compressor(image);

      expect(compressor.options.mimeType).toBe('auto');
    });

    it('should match the given mime type', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      image.name = 'test.jpg';

      const mimeType = 'image/webp';

      return new Promise((resolve) => {
        const compressor = new Compressor(image, {
          mimeType,
          success(result) {
            expect(result.type).toBe(mimeType);
            resolve();
          },
        });

        expect(compressor.options.mimeType).toBe(mimeType);
      });
    });
  });

  describe('quality', () => {
    it('should be `0.8` by default', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const compressor = new Compressor(image);

      expect(compressor.options.quality).toBe(0.8);
    });

    it('should change the size of the output image', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);

      const { result: result06 } = await compress(image, { quality: 0.6 });
      expect(result06.size).toBeLessThan(image.size);

      const { result: result04 } = await compress(image, { quality: 0.4 });
      expect(result04.size).toBeLessThan(result06.size);

      const { result: result02 } = await compress(image, { quality: 0.2 });
      expect(result02.size).toBeLessThan(result04.size);
    });
  });

  describe('convertSize', () => {
    it('should not convert the image from PNG to JPEG', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const compressor = new Compressor(image);

      expect(compressor.options.convertSize).toBe(5000000);

      const { result } = await compress(image);

      expect(image.type).toBe('image/png');
      expect(result.type).toBe('image/png');
    });

    it('should convert the image from PNG to JPEG', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { convertSize: 0 });

      expect(image.type).toBe('image/png');
      expect(result.type).toBe('image/jpeg');
    });
  });

  describe('convertTypes', () => {
    it('should convert the image from PNG to JPEG', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const compressor = new Compressor(image, { convertSize: 0 });

      expect(compressor.options.convertTypes).toEqual(['image/png']);

      const { result } = await compress(image, { convertSize: 0 });

      expect(image.type).toBe('image/png');
      expect(result.type).toBe('image/jpeg');
    });

    it('should not convert the image from PNG to JPEG', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { convertTypes: [], convertSize: 0 });

      expect(image.type).toBe('image/png');
      expect(result.type).toBe('image/png');
    });
  });
});
