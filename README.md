Suger Gif Capture
=================

Chrome plugin for generating easily and in a few clicks an animated gif from the selected content of a page. Sometimes a screenshot is not enough.

How it works:
-------------

* Push the extension button and choose the capture area
* Wait until you are ready for generating the gif
* Push the button again, now you will see the percentage process of the git generation over it.
* When it finishes the extension will open a new tab showing the gif and allowing you to download it.

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