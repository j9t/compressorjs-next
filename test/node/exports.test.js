import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const MINIFIED = 'compressorjs-next/dist/compressor.esm.min.js';

// Guards the package entry points, which the test suite proper cannot reach:
// it runs in the browser against `src`, not against the built package
describe('package entry points', () => {
  it('should expose the class as the default ESM export', async () => {
    const { default: Compressor } = await import('compressorjs-next');

    assert.equal(typeof Compressor, 'function');
    assert.equal(Compressor.name, 'Compressor');
    assert.equal(typeof Compressor.setDefaults, 'function');
  });

  it('should not resolve through require(), as the package is ESM-only', () => {
    assert.throws(
      () => require('compressorjs-next'),
      /ERR_PACKAGE_PATH_NOT_EXPORTED/,
    );
  });

  it('should import cleanly outside the browser', async () => {
    // The module must not touch `window` at load time
    const { default: Compressor } = await import('compressorjs-next');

    assert.doesNotThrow(() => Compressor.setDefaults({ quality: 0.8 }));
  });

  it('should expose the minified build, which the README documents', async () => {
    const { default: Compressor } = await import(MINIFIED);

    assert.equal(typeof Compressor, 'function');
    assert.equal(typeof Compressor.setDefaults, 'function');
  });

  it('should not expose undeclared subpaths', async () => {
    await assert.rejects(
      () => import('compressorjs-next/src/index.js'),
      /ERR_PACKAGE_PATH_NOT_EXPORTED/,
    );
  });
});
