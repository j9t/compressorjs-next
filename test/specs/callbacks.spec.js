import { describe, it, expect } from 'vitest';
import { Compressor, loadImageAsBlob, TEST_IMAGE } from '../setup.js';

describe('callback options', () => {
  describe('success', () => {
    it('should be `null` by default', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const compressor = new Compressor(image);

      expect(compressor.options.success).toBeNull();
    });

    it('should execute the `success` hook function', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);

      return new Promise((resolve) => {
        const compressor = new Compressor(image, {
          success(result) {
            expect(this).toBe(compressor);
            expect(result).toBeInstanceOf(Blob);
            expect(result.name).toBe(image.name);
            resolve();
          },
        });

        expect(compressor.options.success).toBeTypeOf('function');
      });
    });
  });

  describe('error', () => {
    it('should be `null` by default', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const compressor = new Compressor(image);

      expect(compressor.options.error).toBeNull();
    });

    it('should execute the `error` hook function', () => {
      return new Promise((resolve) => {
        const compressor = new Compressor(null, {
          error(error) {
            expect(error).toBeInstanceOf(Error);
            setTimeout(() => {
              expect(this).toBe(compressor);
              resolve();
            });
          },
        });

        expect(compressor.options.error).toBeTypeOf('function');
      });
    });

    it('should throw error directly without an `error` hook function', () => {
      expect(() => {
        new Compressor(null);
      }).toThrow();
    });
  });

  describe('beforeDraw', () => {
    it('should be `null` by default', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const compressor = new Compressor(image);

      expect(compressor.options.beforeDraw).toBeNull();
    });

    it('should execute the `beforeDraw` hook function', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);

      return new Promise((resolve) => {
        const compressor = new Compressor(image, {
          beforeDraw(context, canvas) {
            expect(this).toBe(compressor);
            expect(context).toBeInstanceOf(CanvasRenderingContext2D);
            expect(canvas).toBeInstanceOf(HTMLCanvasElement);
            resolve();
          },
        });

        expect(compressor.options.beforeDraw).toBeTypeOf('function');
      });
    });
  });

  describe('drew', () => {
    it('should be `null` by default', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);
      const compressor = new Compressor(image);

      expect(compressor.options.drew).toBeNull();
    });

    it('should execute the `drew` hook function', async () => {
      const image = await loadImageAsBlob(TEST_IMAGE);

      return new Promise((resolve) => {
        const compressor = new Compressor(image, {
          drew(context, canvas) {
            expect(this).toBe(compressor);
            expect(context).toBeInstanceOf(CanvasRenderingContext2D);
            expect(canvas).toBeInstanceOf(HTMLCanvasElement);
            resolve();
          },
        });

        expect(compressor.options.drew).toBeTypeOf('function');
      });
    });
  });
});
