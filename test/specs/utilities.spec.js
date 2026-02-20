import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { utilities, loadImageAsBlob, TEST_IMAGE, TEST_IMAGE_PNG } from '../setup.js';

const {
  isPositiveNumber,
  isImageType,
  imageTypeToExtension,
  isCanvasReliable,
  resetCanvasReliableCache,
  arrayBufferToDataURL,
  normalizeDecimalNumber,
  getAdjustedSizes,
  getExif,
  insertExif,
  stripExif,
  uint8ArrayToBlob,
} = utilities;

describe('utilities', () => {
  describe('isPositiveNumber', () => {
    it('should return true for positive numbers', () => {
      expect(isPositiveNumber(1)).toBe(true);
      expect(isPositiveNumber(0.5)).toBe(true);
      expect(isPositiveNumber(100)).toBe(true);
    });

    it('should return false for zero', () => {
      expect(isPositiveNumber(0)).toBe(false);
    });

    it('should return false for negative numbers', () => {
      expect(isPositiveNumber(-1)).toBe(false);
      expect(isPositiveNumber(-0.5)).toBe(false);
    });

    it('should return false for Infinity', () => {
      expect(isPositiveNumber(Infinity)).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isPositiveNumber(null)).toBe(false);
      expect(isPositiveNumber(undefined)).toBe(false);
      expect(isPositiveNumber(NaN)).toBe(false);
    });
  });

  describe('isImageType', () => {
    it('should return true for valid image MIME types', () => {
      expect(isImageType('image/jpeg')).toBe(true);
      expect(isImageType('image/png')).toBe(true);
      expect(isImageType('image/webp')).toBe(true);
      expect(isImageType('image/gif')).toBe(true);
    });

    it('should return false for non-image MIME types', () => {
      expect(isImageType('text/plain')).toBe(false);
      expect(isImageType('application/json')).toBe(false);
      expect(isImageType('video/mp4')).toBe(false);
    });

    it('should return false for invalid values', () => {
      expect(isImageType('')).toBe(false);
      expect(isImageType('image')).toBe(false);
      expect(isImageType(null)).toBe(false);
    });
  });

  describe('imageTypeToExtension', () => {
    it('should convert image/jpeg to .jpg', () => {
      expect(imageTypeToExtension('image/jpeg')).toBe('.jpg');
    });

    it('should convert image/png to .png', () => {
      expect(imageTypeToExtension('image/png')).toBe('.png');
    });

    it('should convert image/webp to .webp', () => {
      expect(imageTypeToExtension('image/webp')).toBe('.webp');
    });

    it('should return empty extension for invalid types', () => {
      expect(imageTypeToExtension('text/plain')).toBe('.');
      expect(imageTypeToExtension('')).toBe('.');
    });
  });

  describe('arrayBufferToDataURL', () => {
    it('should convert empty buffer', () => {
      const buffer = new ArrayBuffer(0);
      const result = arrayBufferToDataURL(buffer, 'image/png');

      expect(result).toBe('data:image/png;base64,');
    });

    it('should convert small buffer correctly', () => {
      const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer; // "Hello"
      const result = arrayBufferToDataURL(buffer, 'text/plain');

      expect(result).toBe('data:text/plain;base64,SGVsbG8=');
    });

    it('should handle buffer larger than chunk size', () => {
      // Create a buffer larger than 8192 bytes
      const size = 10000;
      const buffer = new Uint8Array(size);

      for (let i = 0; i < size; i += 1) {
        buffer[i] = i % 256;
      }

      const result = arrayBufferToDataURL(buffer.buffer, 'application/octet-stream');

      expect(typeof result).toBe('string');
      expect(result.startsWith('data:application/octet-stream;base64,')).toBe(true);
    });
  });

  describe('normalizeDecimalNumber', () => {
    it('should return the value unchanged for normal numbers', () => {
      expect(normalizeDecimalNumber(1.5)).toBe(1.5);
      expect(normalizeDecimalNumber(100)).toBe(100);
    });

    it('should normalize floating point errors', () => {
      // 0.1 + 0.2 = 0.30000000000000004 in JavaScript
      const value = 0.30000000000000004;
      const result = normalizeDecimalNumber(value);

      expect(result).toBe(0.3);
    });
  });

  describe('getAdjustedSizes', () => {
    it('should return original sizes when type is none and both dimensions valid', () => {
      const result = getAdjustedSizes({ aspectRatio: 2, width: 200, height: 100 }, 'none');

      expect(result.width).toBe(200);
      expect(result.height).toBe(100);
    });

    it('should calculate height from width when only width is provided', () => {
      const result = getAdjustedSizes({ aspectRatio: 2, width: 200, height: undefined });

      expect(result.width).toBe(200);
      expect(result.height).toBe(100);
    });

    it('should calculate width from height when only height is provided', () => {
      const result = getAdjustedSizes({ aspectRatio: 2, width: undefined, height: 100 });

      expect(result.width).toBe(200);
      expect(result.height).toBe(100);
    });

    it('should contain within bounds for contain type', () => {
      const result = getAdjustedSizes({ aspectRatio: 2, width: 100, height: 100 }, 'contain');

      expect(result.width).toBe(100);
      expect(result.height).toBe(50);
    });

    it('should cover bounds for cover type', () => {
      const result = getAdjustedSizes({ aspectRatio: 2, width: 100, height: 100 }, 'cover');

      expect(result.width).toBe(200);
      expect(result.height).toBe(100);
    });
  });

  describe('getExif', () => {
    it('should return empty array for non-JPEG data', () => {
      const buffer = new Uint8Array([0x89, 0x50, 0x4E, 0x47]).buffer; // PNG signature
      const result = getExif(buffer);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return empty array for JPEG without EXIF', async () => {
      const blob = await loadImageAsBlob(TEST_IMAGE_PNG);
      const arrayBuffer = await blob.arrayBuffer();
      const result = getExif(arrayBuffer);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('insertExif', () => {
    it('should return original buffer if no APP0 marker', () => {
      const buffer = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE1]).buffer; // No APP0
      const result = insertExif(buffer, []);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(4);
    });

    it('should handle empty exifArray', () => {
      // Minimal JPEG with APP0
      const buffer = new Uint8Array([
        0xFF, 0xD8, // SOI
        0xFF, 0xE0, // APP0 marker
        0x00, 0x02, // APP0 length (2 bytes)
        0xFF, 0xD9, // EOI
      ]).buffer;
      const result = insertExif(buffer, []);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result[0]).toBe(0xFF);
      expect(result[1]).toBe(0xD8);
    });
  });

  describe('uint8ArrayToBlob', () => {
    it('should create a Blob with correct type', () => {
      const array = new Uint8Array([1, 2, 3]);
      const result = uint8ArrayToBlob(array, 'image/jpeg');

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('image/jpeg');
      expect(result.size).toBe(3);
    });
  });

  describe('isCanvasReliable', () => {
    let originalGetImageData;

    beforeEach(() => {
      originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
      resetCanvasReliableCache();
    });

    afterEach(() => {
      CanvasRenderingContext2D.prototype.getImageData = originalGetImageData;
      resetCanvasReliableCache();
    });

    it('should return true in a normal browser environment', () => {
      expect(isCanvasReliable()).toBe(true);
    });

    it('should cache the result after the first call', () => {
      expect(isCanvasReliable()).toBe(true);

      // Corrupt canvas after caching
      CanvasRenderingContext2D.prototype.getImageData = function (...args) {
        const imageData = originalGetImageData.apply(this, args);

        imageData.data[0] = 255;
        return imageData;
      };

      // Should still return the cached true
      expect(isCanvasReliable()).toBe(true);
    });

    it('should return false when canvas data is corrupted', () => {
      CanvasRenderingContext2D.prototype.getImageData = function (...args) {
        const imageData = originalGetImageData.apply(this, args);

        // Simulate fingerprinting resistance noise
        imageData.data[0] = 255;
        return imageData;
      };

      expect(isCanvasReliable()).toBe(false);
    });

    it('should return false when canvas throws', () => {
      CanvasRenderingContext2D.prototype.getImageData = function () {
        throw new Error('Security error.');
      };

      expect(isCanvasReliable()).toBe(false);
    });
  });

  describe('stripExif', () => {
    it('should return data unchanged for non-JPEG input', () => {
      const buffer = new Uint8Array([0x89, 0x50, 0x4E, 0x47]).buffer; // PNG signature
      const result = stripExif(buffer);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(4);
      expect(result[0]).toBe(0x89);
    });

    it('should remove EXIF from a real JPEG', async () => {
      const blob = await loadImageAsBlob(TEST_IMAGE);
      const arrayBuffer = await blob.arrayBuffer();
      const exifBefore = getExif(arrayBuffer);

      expect(exifBefore.length).toBeGreaterThan(0);

      const stripped = stripExif(arrayBuffer);
      const exifAfter = getExif(stripped.buffer);

      expect(exifAfter).toHaveLength(0);
      expect(stripped.length).toBeLessThan(arrayBuffer.byteLength);

      // Should still be a valid JPEG (starts with SOI marker)
      expect(stripped[0]).toBe(0xFF);
      expect(stripped[1]).toBe(0xD8);
    });

    it('should keep JPEG data intact when there is no EXIF', () => {
      // Minimal JPEG: SOI + APP0 + SOS + EOI
      const buffer = new Uint8Array([
        0xFF, 0xD8, // SOI
        0xFF, 0xE0, // APP0 marker
        0x00, 0x02, // APP0 length (2 bytes)
        0xFF, 0xDA, // SOS
        0x00, 0x00, // dummy scan data
        0xFF, 0xD9, // EOI
      ]).buffer;
      const result = stripExif(buffer);

      expect(result[0]).toBe(0xFF);
      expect(result[1]).toBe(0xD8);
      expect(result.length).toBe(buffer.byteLength);
    });

    it('should handle a malformed JPEG with truncated segment length', () => {
      // APP1 marker with length larger than remaining buffer
      const buffer = new Uint8Array([
        0xFF, 0xD8, // SOI
        0xFF, 0xE1, // APP1 (EXIF) marker
        0x00, 0xFF, // Length = 255 (but only 2 bytes remain)
        0x00, 0x00, // Truncated data
      ]).buffer;
      const result = stripExif(buffer);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeLessThanOrEqual(buffer.byteLength);
      expect(result[0]).toBe(0xFF);
      expect(result[1]).toBe(0xD8);
    });
  });
});
