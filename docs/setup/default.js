window.addEventListener('DOMContentLoaded', function () {
  var Compressor = window.Compressor;

  var app = Vue.createApp({
    data: function () {
      var vm = this;

      return {
        options: {
          strict: true,
          retainExif: false,
          maxWidth: undefined,
          maxHeight: undefined,
          minWidth: 0,
          minHeight: 0,
          width: undefined,
          height: undefined,
          resize: 'none',
          quality: 0.8,
          mimeType: '',
          convertTypes: '',
          convertSize: 5000000,
          success: function (result) {
            console.log('Output: ', result);

            vm.canvasFallback = this.canvasFallback || false;
            vm.outputURL = URL.createObjectURL(result);
            vm.output = result;
            vm.$refs.input.value = '';
          },
          error: function (err) {
            window.alert(err.message);
          },
        },
        canvasFallback: false,
        inputURL: '',
        outputURL: '',
        input: {},
        output: {},
      };
    },

    methods: {
      prettySize: function (size) {
        var kilobyte = 1024;
        var megabyte = kilobyte * kilobyte;

        if (size > megabyte) {
          return (size / megabyte).toFixed(2) + ' MB';
        } else if (size > kilobyte) {
          return (size / kilobyte).toFixed(2) + ' KB';
        } else if (size >= 0) {
          return size + ' B';
        }

        return 'N/A';
      },

      compress: function (file) {
        if (!file) {
          return;
        }

        console.log('Input: ', file);
        this.inputURL = URL.createObjectURL(file);
        this.input = file;
        new Compressor(file, this.options);
      },

      change: function (e) {
        this.compress(e.target.files ? e.target.files[0] : null);
      },

      dragover: function(e) {
        e.preventDefault();
      },

      drop: function(e) {
        e.preventDefault();
        this.compress(e.dataTransfer.files ? e.dataTransfer.files[0] : null);
      },
    },

    watch: {
      options: {
        deep: true,
        handler: function () {
          this.compress(this.input);
        },
      },
    },

    mounted: function () {
      var vm = this;
      var xhr = new XMLHttpRequest();

      xhr.onload = function () {
        var blob = xhr.response;
        var date = new Date();

        blob.lastModified = date.getTime();
        blob.name = 'demo.jpg';
        vm.compress(blob);
      };
      xhr.open('GET', 'media/demo.jpg');
      xhr.responseType = 'blob';
      xhr.send();
    },
  });

  app.config.compilerOptions.isCustomElement = function (tag) {
    return tag === 'img-comparison-slider';
  };

  app.mount('#app');
});
