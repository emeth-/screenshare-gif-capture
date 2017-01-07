importScripts("GIFEncoder.js", "LZWEncoder.js", "NeuQuant.js");

var images = [];
var total_delay = 0;

this.addEventListener('message', function(e) {
  var data = e.data;
  switch (data.cmd) {
    case 'start':
      images = [];
      break;

    case 'addImage':
      var serializedImageData = data.serializedImageData;
      var imageData = serializedImageData.split(',');
      var newImageData = new Uint8ClampedArray(serializedImageData.length);
      for(var i = 0; i < imageData.length; i++){
        newImageData[i] = imageData[i];
      }
      images.push(newImageData);
      total_delay += data.frame_delay;
      break;

    case 'process':
      var fps = data.fps;
      var width = data.width;
      var height = data.height;
      var encoder = new GIFEncoder();
      encoder.setSize(width, height);
      encoder.setRepeat(0); //0  -> loop forever, 1+ -> loop n times then stop
      encoder.setDelay(total_delay/images.length); //go to next frame every n milliseconds, averaging out the time it took us to take each frame
      encoder.start();

      for (var index = 0; index < images.length; index++) {
        this.postMessage({'cmd': 'progress', 'progress': Math.round((index+1) * 100 / images.length)});
        var imageData = images[index];
        encoder.addFrame(imageData, true);
      }
      encoder.finish();
      this.postMessage({'cmd': 'processed', 'gif': encoder.stream().getData()});
      break;

    default:
      console.log('Unknown command: ' + data.msg);
  };
}, false);
