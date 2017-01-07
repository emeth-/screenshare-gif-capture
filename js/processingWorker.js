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
      images.push(data.serializedImageData);
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
