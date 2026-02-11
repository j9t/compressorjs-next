# Changelog

## 1.0.0 (Feb 11, 2026)

### Breaking Changes

* Adopted [Compressor.js](https://github.com/fengyuanchen/compressorjs) as Compressor.js Next
* Made ESM the default module format via `exports` field (CommonJS still supported)
* Removed `noConflict()` method
* Dropped Internet Explorer support

### Fixed

* Fixed blob URL memory leak in error and abort paths
* Fixed deprecated `substr()` usage

### Changed

* Added `"type": "module"` for native ESM support
* Added `"sideEffects": false` for better tree-shaking support
* Migrated from Karma/Mocha/Chai to Vitest with browser mode for cleaner ESM-native testing
* Converted all test files to `async`/`await` pattern
* Added unit tests for utility functions
* Added tests for blob URL cleanup verification
* Updated TypeScript declarations

### Performance

* Refactored binary handling functions (`getExif`, `insertExif`, `arrayBufferToDataURL`) to use `DataView` instead of `Array.from()` for significantly better memory efficiency on large images
* Updated `.browserslistrc` to target only modern browsers, reducing transpilation overhead

### Internal

* Updated all dependencies
* Removed `blueimp-canvas-to-blob` dependency (`canvas.toBlob()` now universally supported)
* Removed `is-blob` dependency (use native `instanceof Blob`)
* Removed unused dependencies
* Removed Karma/Mocha/Chai testing stack
* Replaced `uglify-js` with `terser`
* Migrated to ESLint flat config
* Removed issue report templates and requirements
* Reviewed and revised entire project
