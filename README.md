Screenshare Gif Capture
=================

Chrome plugin that takes a gif of your interactions with a web page when prompted.

How it works:
-------------

* Push the extension button. The gif will immediately start being captured.
* Push the extension button to stop the gif capture and render the gif (or wait the max length which defaults to 15 seconds).
* Extension will then show a percentage as it works at rendering the gif. Once complete, it will open a page displaying the gif to you.

Settings:
------------
* By default the gifs will have 15 seconds as maximum length, a FPS value (frames per second) of 5 and a quality of 50.
* All this settings can be modified using your right mouse button over the extension icon and choosing "Options".

Instalation:
------------

### From the source code:

* Clone this repo
* In Chrome go to the extensions page chrome://extensions
* Enable developer mode
* Click on "Load unpacked extension…" and select the folder for this app

Credits:
--------

* For building the gif the extension uses the [jsgif library](https://github.com/antimatter15/jsgif)
* The area selection is based on the code from [Chrome screen capture](https://code.google.com/p/chrome-screen-capture/)


Emeth- notes:
------------

* chrome extension api call captureVisibleTab() unfortunately is not instant and takes variably 1-2 seconds, resulting in gifs that miss a lot of detail.
* mouse position is not recorded (though perhaps could be simulated by injecting javascript that makes a fake mouse cursor image track your actual mouse position)
* chrome inspector's overlayed above the website ARE included.
* retina displays work with my patch

Emeth- Takesaways:
------------

* Seems like it would work great for still images (could modify this gif repo for it, or here's a repo focused around stills: https://github.com/mrcoles/full-page-screen-capture-chrome-extension)
* Gif quality is ok. The resulting gifs are pretty big though, not optimized. Also they have by necessity the 1-2 second delay, which is not smooth.
* There is one other avenue that could be pursued for the chrome extension approach, which is a webRTC 'share desktop' stream kind of thing. Looks complicated. https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Chrome-Extensions/desktopCapture