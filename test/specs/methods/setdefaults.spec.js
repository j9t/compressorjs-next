import { describe, it, expect } from 'vitest';
import { Compressor, loadImageAsBlob, TEST_IMAGE_PNG } from '../../setup.js';

describe('setDefaults', () => {
  it('should be a static method', () => {
    expect(Compressor.setDefaults).toBeTypeOf('function');
  });

  it('should change the global default options', async () => {
    Compressor.setDefaults({
      strict: false,
    });

    const image = await loadImageAsBlob(TEST_IMAGE_PNG);

    return new Promise((resolve) => {
      new Compressor(image, {
        quality: 1,
        success(result) {
          expect(result).not.toBe(image);

          // Reverts it for the rest test suites
          Compressor.setDefaults({
            strict: true,
          });
          resolve();
        },
      });
    });
  });
});
