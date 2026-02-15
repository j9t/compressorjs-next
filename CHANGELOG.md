# Changelog

All notable changes to Compressor.js Next are documented in this file, which is (mostly) AI-generated and (always) human-edited. Dependency updates may or may not be called out specifically.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-02-15

### Changed

* Added warning when canvas is unreliable or produces no output
* Removed deprecated `lastModifiedDate` property from output (use `lastModified` instead)

### Fixed

* Added detection for unreliable canvas (e.g., Firefox `privacy.resistFingerprinting`), falling back to returning the original image with EXIF stripped, instead of silently corrupted output ([fengyuanchen/compressorjs#177](https://github.com/fengyuanchen/compressorjs/issues/177))

## [1.1.0] - 2026-02-12

### Breaking Changes

* **BREAKING:** Changed `convertTypes` default from `['image/png']` to `[]` to preserve PNG transparency by default ([fengyuanchen/compressorjs#184](https://github.com/fengyuanchen/compressorjs/issues/184)) [not made major release due to package being so new]

### Fixed

* Explicit `mimeType` option is no longer overridden by `convertTypes`/`convertSize` auto-conversion

## [1.0.2] - 2026-02-12

### Internal

* Tightened package documentation

## [1.0.1] - 2026-02-11

### Internal

* Simplified demo
* Added makeshift development server option

## [1.0.0] - 2026-02-11

### Breaking Changes

* **BREAKING:** Adopted [Compressor.js](https://github.com/fengyuanchen/compressorjs) as Compressor.js Next
* **BREAKING:** Made ESM the default module format via `exports` field (CommonJS still supported)
* **BREAKING:** Removed `noConflict()` method
* **BREAKING:** Dropped Internet Explorer support

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
