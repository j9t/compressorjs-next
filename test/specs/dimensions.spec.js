import { describe, it, expect } from 'vitest';
import { Compressor, loadImageAsBlob, compress, getImageDimensions, TEST_IMAGE, TEST_IMAGE_PNG } from '../setup.js';

describe('dimension options', () => {
  describe('width', () => {
    it('should be `undefined` by default', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const compressor = new Compressor(image);

      expect(compressor.options.width).toBeUndefined();
    });

    it('should equal to the given width', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { width: 100 });
      const { width } = await getImageDimensions(result);

      expect(width).toBe(100);
    });

    it('should equal to the given width even when rotated', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const { result } = await compress(image, { width: 100 });
      const { width } = await getImageDimensions(result);

      expect(width).toBe(100);
    });

    it('should be ignored when the given width does not greater than 0', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { width: -100 });
      const { width } = await getImageDimensions(result);

      expect(width).toBeGreaterThan(0);
    });

    it('should be floored when it contains decimal number', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      // eslint-disable-next-line no-loss-of-precision
      const { result } = await compress(image, { width: 100.30000000000000004 });
      const { width } = await getImageDimensions(result);

      expect(width).toBe(100);
    });

    it('should be resized to fit the aspect ratio of the original image when the `height` option is set', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { width: 100, height: 60 });
      const { width, height } = await getImageDimensions(result);

      expect(width).toBe(50);
      expect(height).toBe(60);
    });

    it('should be resized to fit the aspect ratio of the original image when the `height` option is set even when rotated', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const { result } = await compress(image, { width: 100, height: 60 });
      const { width, height } = await getImageDimensions(result);

      expect(width).toBe(50);
      expect(height).toBe(60);
    });

    it('should be ignored when the `minWidth` option is set and its value is greater', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { width: 100, minWidth: 200 });
      const { width } = await getImageDimensions(result);

      expect(width).toBe(200);
    });

    it('should be ignored when the `maxWidth` option is set and its value is lesser', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { width: 200, maxWidth: 100 });
      const { width } = await getImageDimensions(result);

      expect(width).toBe(100);
    });
  });

  describe('height', () => {
    it('should be `undefined` by default', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const compressor = new Compressor(image);

      expect(compressor.options.height).toBeUndefined();
    });

    it('should equal to the given height', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { height: 100 });
      const { height } = await getImageDimensions(result);

      expect(height).toBe(100);
    });

    it('should equal to the given height even when rotated', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const { result } = await compress(image, { height: 100 });
      const { height } = await getImageDimensions(result);

      expect(height).toBe(100);
    });

    it('should be ignored when the given height does not greater than 0', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { height: -100 });
      const { height } = await getImageDimensions(result);

      expect(height).toBeGreaterThan(0);
    });

    it('should be floored when it contains decimal number', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      // eslint-disable-next-line no-loss-of-precision
      const { result } = await compress(image, { height: 100.30000000000000004 });
      const { height } = await getImageDimensions(result);

      expect(height).toBe(100);
    });

    it('should be resized to fit the aspect ratio of the original image when the `width` option is set', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { width: 50, height: 100 });
      const { width, height } = await getImageDimensions(result);

      expect(width).toBe(50);
      expect(height).toBe(60);
    });

    it('should be resized to fit the aspect ratio of the original image when the `width` option is set even when rotated', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const { result } = await compress(image, { width: 50, height: 100 });
      const { width, height } = await getImageDimensions(result);

      expect(width).toBe(50);
      expect(height).toBe(60);
    });

    it('should be ignored when the `minHeight` option is set and its value is greater', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { height: 100, minHeight: 200 });
      const { height } = await getImageDimensions(result);

      expect(height).toBe(200);
    });

    it('should be ignored when the `maxHeight` option is set and its value is lesser', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { height: 200, maxHeight: 100 });
      const { height } = await getImageDimensions(result);

      expect(height).toBe(100);
    });
  });

  describe('maxWidth', () => {
    it('should be `Infinity` by default', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const compressor = new Compressor(image);

      expect(compressor.options.maxWidth).toBe(Infinity);
    });

    it('should not be greater than the given maximum width', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { maxWidth: 100 });
      const { width } = await getImageDimensions(result);

      expect(width).toBe(100);
    });

    it('should not be greater than the given maximum width even when rotated', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const { result } = await compress(image, { maxWidth: 100 });
      const { width } = await getImageDimensions(result);

      expect(width).toBe(100);
    });

    it('should be ignored when the given maximum width does not greater than 0', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { maxWidth: -100 });
      const { width } = await getImageDimensions(result);

      expect(width).toBeGreaterThan(0);
    });

    it('should be resized to fit the aspect ratio of the original image when the `maxHeight` option is set', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { maxWidth: 100, maxHeight: 60 });
      const { width, height } = await getImageDimensions(result);

      expect(width).toBe(50);
      expect(height).toBe(60);
    });
  });

  describe('maxHeight', () => {
    it('should be `Infinity` by default', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const compressor = new Compressor(image);

      expect(compressor.options.maxHeight).toBe(Infinity);
    });

    it('should not be greater than the given maximum height', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { maxHeight: 100 });
      const { height } = await getImageDimensions(result);

      expect(height).toBe(100);
    });

    it('should not be greater than the given maximum height even when rotated', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const { result } = await compress(image, { maxHeight: 100 });
      const { height } = await getImageDimensions(result);

      expect(height).toBe(100);
    });

    it('should be ignored when the given maximum height does not greater than 0', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { maxHeight: -100 });
      const { height } = await getImageDimensions(result);

      expect(height).toBeGreaterThan(0);
    });

    it('should be resized to fit the aspect ratio of the original image when the `maxWidth` option is set', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { maxWidth: 50, maxHeight: 100 });
      const { width, height } = await getImageDimensions(result);

      expect(width).toBe(50);
      expect(height).toBe(60);
    });
  });

  describe('minWidth', () => {
    it('should be `0` by default', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const compressor = new Compressor(image);

      expect(compressor.options.minWidth).toBe(0);
    });

    it('should not be less than the given minimum width', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { minWidth: 1000 });
      const { width } = await getImageDimensions(result);

      expect(width).toBe(1000);
    });

    it('should not be less than the given minimum width even when rotated', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const { result } = await compress(image, { minWidth: 1000 });
      const { width } = await getImageDimensions(result);

      expect(width).toBe(1000);
    });

    it('should be ignored when the given minimum width does not greater than 0', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { minWidth: -1000 });
      const { width } = await getImageDimensions(result);

      expect(width).toBeGreaterThan(0);
    });

    it('should be resized to fit the aspect ratio of the original image when the `minHeight` option is set', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { minWidth: 1000, minHeight: 900 });
      const { width, height } = await getImageDimensions(result);

      expect(width).toBe(1000);
      expect(height).toBe(1200);
    });

    it('should be ignored when the `maxWidth` is set and its value is lesser', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { minWidth: 1000, maxWidth: 100 });
      const { width } = await getImageDimensions(result);

      expect(width).toBe(100);
    });
  });

  describe('minHeight', () => {
    it('should be `0` by default', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const compressor = new Compressor(image);

      expect(compressor.options.minHeight).toBe(0);
    });

    it('should not be less than the given minimum height', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { minHeight: 1000 });
      const { height } = await getImageDimensions(result);

      expect(height).toBe(1000);
    });

    it('should not be less than the given minimum height even when rotated', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const { result } = await compress(image, { minHeight: 1000 });
      const { height } = await getImageDimensions(result);

      expect(height).toBe(1000);
    });

    it('should be ignored when the given minimum height does not greater than 0', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { minHeight: -1000 });
      const { height } = await getImageDimensions(result);

      expect(height).toBeGreaterThan(0);
    });

    it('should be resized to fit the aspect ratio of the original image when the `minWidth` option is set', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { minWidth: 750, minHeight: 1000 });
      const { width, height } = await getImageDimensions(result);

      expect(width).toBe(833);
      expect(height).toBe(1000);
    });

    it('should be ignored when the `maxHeight` is set and its value is lesser', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE_PNG);
      const { result } = await compress(image, { minHeight: 1000, maxHeight: 100 });
      const { height } = await getImageDimensions(result);

      expect(height).toBe(100);
    });
  });

  describe('resize', () => {
    describe('none', () => {
      it('should be "none" by default', async () => {
        const image = await loadImageAsBlob(TEST_IMAGE_PNG);
        const compressor = new Compressor(image);

        expect(compressor.options.resize).toBe('none');
      });
    });

    describe('contain', () => {
      it('should be "contain"', async () => {
        const image = await loadImageAsBlob(TEST_IMAGE_PNG);
        const compressor = new Compressor(image, { resize: 'contain' });

        expect(compressor.options.resize).toBe('contain');
      });

      describe('maxWidth/Height', () => {
        it('should not be greater than the given maximum width', async () => {
          const image = await loadImageAsBlob(TEST_IMAGE_PNG);
          const { result } = await compress(image, { maxWidth: 100, resize: 'contain' });
          const { width } = await getImageDimensions(result);

          expect(width).toBeLessThanOrEqual(100);
        });

        it('should not be greater than the given maximum height', async () => {
          const image = await loadImageAsBlob(TEST_IMAGE_PNG);
          const { result } = await compress(image, { maxHeight: 100, resize: 'contain' });
          const { height } = await getImageDimensions(result);

          expect(height).toBeLessThanOrEqual(100);
        });

        it('should not be greater than both the given maximum width and height', async () => {
          const image = await loadImageAsBlob(TEST_IMAGE_PNG);
          const { result } = await compress(image, { maxWidth: 100, maxHeight: 100, resize: 'contain' });
          const { width, height } = await getImageDimensions(result);

          expect(width).toBeLessThanOrEqual(100);
          expect(height).toBeLessThanOrEqual(100);
        });
      });

      describe('minWidth/Height', () => {
        it('should not be less than the given minimum width', async () => {
          const image = await loadImageAsBlob(TEST_IMAGE_PNG);
          const { result } = await compress(image, { minWidth: 1000, resize: 'contain' });
          const { width } = await getImageDimensions(result);

          expect(width).toBeGreaterThanOrEqual(1000);
        });

        it('should not be less than the given minimum height', async () => {
          const image = await loadImageAsBlob(TEST_IMAGE_PNG);
          const { result } = await compress(image, { minHeight: 1000, resize: 'contain' });
          const { height } = await getImageDimensions(result);

          expect(height).toBeGreaterThanOrEqual(1000);
        });

        it('should not be less than both the given minimum width and height', async () => {
          const image = await loadImageAsBlob(TEST_IMAGE_PNG);
          const { result } = await compress(image, { minWidth: 1000, minHeight: 1000, resize: 'contain' });
          const { width, height } = await getImageDimensions(result);

          expect(width).toBeGreaterThanOrEqual(1000);
          expect(height).toBeGreaterThanOrEqual(1000);
        });
      });

      describe('width/Height', () => {
        it('should be ignored when only the `width` option is set', async () => {
          const image = await loadImageAsBlob(TEST_IMAGE_PNG);
          const { result } = await compress(image, { width: 1000, resize: 'contain' });
          const { width, height } = await getImageDimensions(result);

          expect(width).toBe(1000);
          expect(height).toBe(1200);
        });

        it('should be ignored when only the `height` option is set', async () => {
          const image = await loadImageAsBlob(TEST_IMAGE_PNG);
          const { result } = await compress(image, { height: 1000, resize: 'contain' });
          const { width, height } = await getImageDimensions(result);

          expect(width).toBe(833);
          expect(height).toBe(1000);
        });

        it('should equal to both the given width and height', async () => {
          const image = await loadImageAsBlob(TEST_IMAGE_PNG);
          const { result } = await compress(image, { width: 1000, height: 1000, resize: 'contain' });
          const { width, height } = await getImageDimensions(result);

          expect(width).toBe(1000);
          expect(height).toBe(1000);
        });
      });
    });

    describe('cover', () => {
      it('should be "cover"', async () => {
        const image = await loadImageAsBlob(TEST_IMAGE_PNG);
        const compressor = new Compressor(image, { resize: 'cover' });

        expect(compressor.options.resize).toBe('cover');
      });

      describe('maxWidth/Height', () => {
        it('should not be greater than the given maximum width', async () => {
          const image = await loadImageAsBlob(TEST_IMAGE_PNG);
          const { result } = await compress(image, { maxWidth: 100, resize: 'cover' });
          const { width } = await getImageDimensions(result);

          expect(width).toBeLessThanOrEqual(100);
        });

        it('should not be greater than the given maximum height', async () => {
          const image = await loadImageAsBlob(TEST_IMAGE_PNG);
          const { result } = await compress(image, { maxHeight: 100, resize: 'cover' });
          const { height } = await getImageDimensions(result);

          expect(height).toBeLessThanOrEqual(100);
        });

        it('should not be greater than both the given maximum width and height', async () => {
          const image = await loadImageAsBlob(TEST_IMAGE_PNG);
          const { result } = await compress(image, { maxWidth: 100, maxHeight: 100, resize: 'cover' });
          const { width, height } = await getImageDimensions(result);

          expect(width).toBeLessThanOrEqual(100);
          expect(height).toBeLessThanOrEqual(100);
        });
      });

      describe('minWidth/Height', () => {
        it('should not be less than the given minimum width', async () => {
          const image = await loadImageAsBlob(TEST_IMAGE_PNG);
          const { result } = await compress(image, { minWidth: 1000, resize: 'cover' });
          const { width } = await getImageDimensions(result);

          expect(width).toBeGreaterThanOrEqual(1000);
        });

        it('should not be less than the given minimum height', async () => {
          const image = await loadImageAsBlob(TEST_IMAGE_PNG);
          const { result } = await compress(image, { minHeight: 1000, resize: 'cover' });
          const { height } = await getImageDimensions(result);

          expect(height).toBeGreaterThanOrEqual(1000);
        });

        it('should not be less than both the given minimum width and height', async () => {
          const image = await loadImageAsBlob(TEST_IMAGE_PNG);
          const { result } = await compress(image, { minWidth: 1000, minHeight: 1000, resize: 'cover' });
          const { width, height } = await getImageDimensions(result);

          expect(width).toBeGreaterThanOrEqual(1000);
          expect(height).toBeGreaterThanOrEqual(1000);
        });
      });

      describe('width/Height', () => {
        it('should be ignored when only the `width` option is set', async () => {
          const image = await loadImageAsBlob(TEST_IMAGE_PNG);
          const { result } = await compress(image, { width: 1000, resize: 'cover' });
          const { width, height } = await getImageDimensions(result);

          expect(width).toBe(1000);
          expect(height).toBe(1200);
        });

        it('should be ignored when only the `height` option is set', async () => {
          const image = await loadImageAsBlob(TEST_IMAGE_PNG);
          const { result } = await compress(image, { height: 1000, resize: 'cover' });
          const { width, height } = await getImageDimensions(result);

          expect(width).toBe(833);
          expect(height).toBe(1000);
        });

        it('should equal to both the given width and height', async () => {
          const image = await loadImageAsBlob(TEST_IMAGE_PNG);
          const { result } = await compress(image, { width: 1000, height: 1000, resize: 'cover' });
          const { width, height } = await getImageDimensions(result);

          expect(width).toBe(1000);
          expect(height).toBe(1000);
        });
      });
    });
  });
});
