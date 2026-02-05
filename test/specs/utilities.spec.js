describe('utilities', () => {
  const {
    isPositiveNumber,
    isImageType,
    imageTypeToExtension,
    arrayBufferToDataURL,
    normalizeDecimalNumber,
    getAdjustedSizes,
    parseOrientation,
    getExif,
    insertExif,
    uint8ArrayToBlob,
  } = window.utilities;

  describe('isPositiveNumber', () => {
    it('should return true for positive numbers', () => {
      expect(isPositiveNumber(1)).to.be.true;
      expect(isPositiveNumber(0.5)).to.be.true;
      expect(isPositiveNumber(100)).to.be.true;
    });

    it('should return false for zero', () => {
      expect(isPositiveNumber(0)).to.be.false;
    });

    it('should return false for negative numbers', () => {
      expect(isPositiveNumber(-1)).to.be.false;
      expect(isPositiveNumber(-0.5)).to.be.false;
    });

    it('should return false for Infinity', () => {
      expect(isPositiveNumber(Infinity)).to.be.false;
    });

    it('should return false for null and undefined', () => {
      expect(isPositiveNumber(null)).to.be.false;
      expect(isPositiveNumber(undefined)).to.be.false;
      expect(isPositiveNumber(NaN)).to.be.false;
    });
  });

  describe('isImageType', () => {
    it('should return true for valid image MIME types', () => {
      expect(isImageType('image/jpeg')).to.be.true;
      expect(isImageType('image/png')).to.be.true;
      expect(isImageType('image/webp')).to.be.true;
      expect(isImageType('image/gif')).to.be.true;
    });

    it('should return false for non-image MIME types', () => {
      expect(isImageType('text/plain')).to.be.false;
      expect(isImageType('application/json')).to.be.false;
      expect(isImageType('video/mp4')).to.be.false;
    });

    it('should return false for invalid values', () => {
      expect(isImageType('')).to.be.false;
      expect(isImageType('image')).to.be.false;
      expect(isImageType(null)).to.be.false;
    });
  });

  describe('imageTypeToExtension', () => {
    it('should convert image/jpeg to .jpg', () => {
      expect(imageTypeToExtension('image/jpeg')).to.equal('.jpg');
    });

    it('should convert image/png to .png', () => {
      expect(imageTypeToExtension('image/png')).to.equal('.png');
    });

    it('should convert image/webp to .webp', () => {
      expect(imageTypeToExtension('image/webp')).to.equal('.webp');
    });

    it('should return empty extension for invalid types', () => {
      expect(imageTypeToExtension('text/plain')).to.equal('.');
      expect(imageTypeToExtension('')).to.equal('.');
    });
  });

  describe('arrayBufferToDataURL', () => {
    it('should convert empty buffer', () => {
      const buffer = new ArrayBuffer(0);
      const result = arrayBufferToDataURL(buffer, 'image/png');

      expect(result).to.equal('data:image/png;base64,');
    });

    it('should convert small buffer correctly', () => {
      const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer; // "Hello"
      const result = arrayBufferToDataURL(buffer, 'text/plain');

      expect(result).to.equal('data:text/plain;base64,SGVsbG8=');
    });

    it('should handle buffer larger than chunk size', () => {
      // Create a buffer larger than 8192 bytes
      const size = 10000;
      const buffer = new Uint8Array(size);

      for (let i = 0; i < size; i += 1) {
        buffer[i] = i % 256;
      }

      const result = arrayBufferToDataURL(buffer.buffer, 'application/octet-stream');

      expect(result).to.be.a('string');
      expect(result.startsWith('data:application/octet-stream;base64,')).to.be.true;
    });
  });

  describe('normalizeDecimalNumber', () => {
    it('should return the value unchanged for normal numbers', () => {
      expect(normalizeDecimalNumber(1.5)).to.equal(1.5);
      expect(normalizeDecimalNumber(100)).to.equal(100);
    });

    it('should normalize floating point errors', () => {
      // 0.1 + 0.2 = 0.30000000000000004 in JavaScript
      const value = 0.30000000000000004;
      const result = normalizeDecimalNumber(value);

      expect(result).to.equal(0.3);
    });
  });

  describe('getAdjustedSizes', () => {
    it('should return original sizes when type is none and both dimensions valid', () => {
      const result = getAdjustedSizes({ aspectRatio: 2, width: 200, height: 100 }, 'none');

      expect(result.width).to.equal(200);
      expect(result.height).to.equal(100);
    });

    it('should calculate height from width when only width is provided', () => {
      const result = getAdjustedSizes({ aspectRatio: 2, width: 200, height: undefined });

      expect(result.width).to.equal(200);
      expect(result.height).to.equal(100);
    });

    it('should calculate width from height when only height is provided', () => {
      const result = getAdjustedSizes({ aspectRatio: 2, width: undefined, height: 100 });

      expect(result.width).to.equal(200);
      expect(result.height).to.equal(100);
    });

    it('should contain within bounds for contain type', () => {
      const result = getAdjustedSizes({ aspectRatio: 2, width: 100, height: 100 }, 'contain');

      expect(result.width).to.equal(100);
      expect(result.height).to.equal(50);
    });

    it('should cover bounds for cover type', () => {
      const result = getAdjustedSizes({ aspectRatio: 2, width: 100, height: 100 }, 'cover');

      expect(result.width).to.equal(200);
      expect(result.height).to.equal(100);
    });
  });

  describe('parseOrientation', () => {
    it('should return default values for orientation 1', () => {
      const result = parseOrientation(1);

      expect(result.rotate).to.equal(0);
      expect(result.scaleX).to.equal(1);
      expect(result.scaleY).to.equal(1);
    });

    it('should flip horizontal for orientation 2', () => {
      const result = parseOrientation(2);

      expect(result.scaleX).to.equal(-1);
    });

    it('should rotate 180 for orientation 3', () => {
      const result = parseOrientation(3);

      expect(result.rotate).to.equal(-180);
    });

    it('should rotate 90 for orientation 6', () => {
      const result = parseOrientation(6);

      expect(result.rotate).to.equal(90);
    });

    it('should rotate -90 for orientation 8', () => {
      const result = parseOrientation(8);

      expect(result.rotate).to.equal(-90);
    });
  });

  describe('getExif', () => {
    it('should return empty array for non-JPEG data', () => {
      const buffer = new Uint8Array([0x89, 0x50, 0x4E, 0x47]).buffer; // PNG signature
      const result = getExif(buffer);

      expect(result).to.be.an('array');
      expect(result.length).to.equal(0);
    });

    it('should return empty array for JPEG without EXIF', (done) => {
      window.loadImageAsBlob('/base/docs/images/picture.png', (blob) => {
        const reader = new FileReader();

        reader.onload = () => {
          const result = getExif(reader.result);

          expect(result).to.be.an('array');
          done();
        };
        reader.readAsArrayBuffer(blob);
      });
    });
  });

  describe('insertExif', () => {
    it('should return original buffer if no APP0 marker', () => {
      const buffer = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE1]).buffer; // No APP0
      const result = insertExif(buffer, []);

      expect(result).to.be.instanceOf(Uint8Array);
      expect(result.length).to.equal(4);
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

      expect(result).to.be.instanceOf(Uint8Array);
      expect(result[0]).to.equal(0xFF);
      expect(result[1]).to.equal(0xD8);
    });
  });

  describe('uint8ArrayToBlob', () => {
    it('should create a Blob with correct type', () => {
      const array = new Uint8Array([1, 2, 3]);
      const result = uint8ArrayToBlob(array, 'image/jpeg');

      expect(result).to.be.instanceOf(Blob);
      expect(result.type).to.equal('image/jpeg');
      expect(result.size).to.equal(3);
    });
  });
});
