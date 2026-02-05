import { describe, it, expect } from 'vitest';
import { Compressor, loadImageAsBlob, TEST_IMAGE } from '../../setup.js';

describe('abort', () => {
  it('should abort the compressing process before read', async () => {
    const image = await loadImageAsBlob(TEST_IMAGE);

    return new Promise((resolve) => {
      const compressor = new Compressor(image, {
        success() {
          expect.fail('Should not succeed');
        },
        error(err) {
          expect(err.message).toBe('Aborted to read the image with FileReader.');
          resolve();
        },
      });

      compressor.abort();
    });
  });

  it('should abort the compressing process before load', async () => {
    const image = await loadImageAsBlob(TEST_IMAGE);

    return new Promise((resolve) => {
      const compressor = new Compressor(image, {
        checkOrientation: false,
        success() {
          expect.fail('Should not succeed');
        },
        error(err) {
          expect(err.message).toBe('Aborted to load the image.');
          resolve();
        },
      });

      compressor.abort();
    });
  });

  it('should abort the compressing process before draw', async () => {
    const image = await loadImageAsBlob(TEST_IMAGE);

    return new Promise((resolve) => {
      new Compressor(image, {
        beforeDraw() {
          this.abort();
        },
        drew() {
          expect.fail('Should not call drew');
        },
        error(err) {
          expect(err.message).toBe('The compression process has been aborted.');
          resolve();
        },
      });
    });
  });

  it('should abort the compressing process after drew', async () => {
    const image = await loadImageAsBlob(TEST_IMAGE);

    return new Promise((resolve) => {
      new Compressor(image, {
        drew() {
          this.abort();
        },
        success() {
          expect.fail('Should not succeed');
        },
        error(err) {
          expect(err.message).toBe('The compression process has been aborted.');
          resolve();
        },
      });
    });
  });

  it('should abort the compressing process before output', async () => {
    const image = await loadImageAsBlob(TEST_IMAGE);

    return new Promise((resolve) => {
      new Compressor(image, {
        drew() {
          setTimeout(() => {
            this.abort();
          }, 0);
        },
        success() {
          expect.fail('Should not succeed');
        },
        error(err) {
          expect(err.message).toBe('The compression process has been aborted.');
          resolve();
        },
      });
    });
  });

  it('should only be aborted once', async () => {
    const image = await loadImageAsBlob(TEST_IMAGE);

    return new Promise((resolve) => {
      let count = 0;
      const compressor = new Compressor(image, {
        error() {
          count += 1;
          compressor.abort();
        },
      });

      compressor.abort();
      setTimeout(() => {
        expect(count).toBe(1);
        resolve();
      }, 500);
    });
  });

  it('should revoke blob URL when aborted before load', async () => {
    const image = await loadImageAsBlob(TEST_IMAGE);

    return new Promise((resolve) => {
      const compressor = new Compressor(image, {
        checkOrientation: false,
        error() {
          expect(compressor.url).toBeNull();
          resolve();
        },
      });

      expect(compressor.url).toBeTypeOf('string');
      expect(compressor.url.startsWith('blob:')).toBe(true);
      compressor.abort();
    });
  });

  it('should revoke blob URL when aborted during draw', async () => {
    const image = await loadImageAsBlob(TEST_IMAGE);

    return new Promise((resolve) => {
      let urlBeforeAbort;

      new Compressor(image, {
        checkOrientation: false,
        beforeDraw() {
          urlBeforeAbort = this.url;
          this.abort();
        },
        error() {
          expect(urlBeforeAbort).toBeTypeOf('string');
          expect(this.url).toBeNull();
          resolve();
        },
      });
    });
  });

  it('should revoke blob URL on successful completion', async () => {
    const image = await loadImageAsBlob(TEST_IMAGE);

    return new Promise((resolve) => {
      new Compressor(image, {
        checkOrientation: false,
        success() {
          expect(this.url).toBeNull();
          resolve();
        },
      });
    });
  });
});
