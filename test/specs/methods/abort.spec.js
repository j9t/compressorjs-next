describe('abort', () => {
  it('should abort the compressing process before read', (done) => {
    window.loadImageAsBlob('/base/docs/images/picture.jpg', (image) => {
      const compressor = new Compressor(image, {
        success() {
          expect.fail(1, 0);
        },
        error(err) {
          expect(err.message).to.equal('Aborted to read the image with FileReader.');
        },
      });

      // The first asynchronous process will be image reading when enable orientation checking
      compressor.abort();
      done();
    });
  });

  it('should abort the compressing process before load', (done) => {
    window.loadImageAsBlob('/base/docs/images/picture.jpg', (image) => {
      const compressor = new Compressor(image, {
        checkOrientation: false,
        success() {
          expect.fail(1, 0);
        },
        error(err) {
          expect(err.message).to.equal('Aborted to load the image.');
        },
      });

      // The first asynchronous process will be image loading when disable orientation checking
      compressor.abort();
      done();
    });
  });

  it('should abort the compressing process before draw', (done) => {
    window.loadImageAsBlob('/base/docs/images/picture.jpg', (image) => {
      new Compressor(image, {
        beforeDraw() {
          this.abort();
        },
        drew() {
          expect.fail(1, 0);
        },
        error(err) {
          expect(err.message).to.equal('The compression process has been aborted.');
          done();
        },
      });
    });
  });

  it('should abort the compressing process after drew', (done) => {
    window.loadImageAsBlob('/base/docs/images/picture.jpg', (image) => {
      new Compressor(image, {
        drew() {
          this.abort();
        },
        success() {
          expect.fail(1, 0);
        },
        error(err) {
          expect(err.message).to.equal('The compression process has been aborted.');
          done();
        },
      });
    });
  });

  it('should abort the compressing process before output', (done) => {
    window.loadImageAsBlob('/base/docs/images/picture.jpg', (image) => {
      new Compressor(image, {
        drew() {
          setTimeout(() => {
            this.abort();
          }, 0);
        },
        success() {
          expect.fail(1, 0);
        },
        error(err) {
          expect(err.message).to.equal('The compression process has been aborted.');
          done();
        },
      });
    });
  });

  it('should only can be aborted once', (done) => {
    window.loadImageAsBlob('/base/docs/images/picture.jpg', (image) => {
      let count = 0;
      const compressor = new Compressor(image, {
        error() {
          count += 1;
          compressor.abort();
        },
      });

      compressor.abort();
      setTimeout(() => {
        expect(count).to.equal(1);
        done();
      }, 500);
    });
  });

  it('should revoke blob URL when aborted before load', (done) => {
    window.loadImageAsBlob('/base/docs/images/picture.jpg', (image) => {
      const compressor = new Compressor(image, {
        checkOrientation: false,
        error() {
          // After abort, the url should be revoked (set to null)
          expect(compressor.url).to.be.null;
          done();
        },
      });

      // Abort immediately - url should exist at this point
      expect(compressor.url).to.be.a('string');
      expect(compressor.url.startsWith('blob:')).to.be.true;
      compressor.abort();
    });
  });

  it('should revoke blob URL when aborted during draw', (done) => {
    window.loadImageAsBlob('/base/docs/images/picture.jpg', (image) => {
      let urlBeforeAbort;

      new Compressor(image, {
        checkOrientation: false,
        beforeDraw() {
          urlBeforeAbort = this.url;
          this.abort();
        },
        error() {
          expect(urlBeforeAbort).to.be.a('string');
          expect(this.url).to.be.null;
          done();
        },
      });
    });
  });

  it('should revoke blob URL on successful completion', (done) => {
    window.loadImageAsBlob('/base/docs/images/picture.jpg', (image) => {
      new Compressor(image, {
        checkOrientation: false,
        success() {
          // URL should be revoked after successful completion
          expect(this.url).to.be.null;
          done();
        },
      });
    });
  });
});
