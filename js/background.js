// Copyright (c) 2009 The Chromium Authors. All rights reserved.  Use of this
// source code is governed by a BSD-style license that can be found in the
// LICENSE file.

var screenshot = {
  tab: 0,
  canvas: document.createElement("canvas"),
  startX: 0,
  startY: 0,
  scrollX: 0,
  scrollY: 0,
  docHeight: 0,
  docWidth: 0,
  visibleWidth: 0,
  visibleHeight: 0,
  scrollXCount: 0,
  scrollYCount: 0,
  scrollBarX: 17,
  scrollBarY: 17,
  captureStatus: true,
  isRecording: false,
  isProcessing: false,
  timer: null,
  binary_gif: null,
  imageDataBase_64: null,
  processingWorker: null,
  isProcessing: false,

  /**
  * Receive messages from content_script, and then decide what to do next
  */
  addMessageListener: function() {
    chrome.extension.onMessage.addListener(function(request, sender, response) {
      var obj = request;
      //alert("Background message listener" + obj.msg);
      switch (obj.msg) {
        case 'capture_selected':
          screenshot.captureSelected();
          break;
      }
    });
  },


  /**
  * Send the Message to content-script
  */
  sendMessage: function(message, callback) {
    chrome.tabs.getSelected(null, function(tab) {
      //alert("Background message sender" + message.msg);
      chrome.tabs.sendMessage(tab.id, message, callback);
    });
  },

  showSelectionArea: function() {
    screenshot.sendMessage({msg: 'capture_selected_area'},
        screenshot.onResponseVisibleSize);
  },

  captureSelected: function() {
    screenshot.sendMessage({msg: 'capture_selected_area'},
        screenshot.onResponseVisibleSize);
  },

  onResponseVisibleSize: function(response) {
    screenshot.startX = response.startX,
    screenshot.startY = response.startY,
    screenshot.scrollX = response.scrollX,
    screenshot.scrollY = response.scrollY,
    screenshot.canvas.width = response.canvasWidth*response.devicePixelRatio;
    screenshot.canvas.height = response.canvasHeight*response.devicePixelRatio;
    screenshot.visibleHeight = response.visibleHeight,
    screenshot.visibleWidth = response.visibleWidth,
    screenshot.scrollXCount = response.scrollXCount;
    screenshot.scrollYCount = response.scrollYCount;
    screenshot.docWidth = response.docWidth;
    screenshot.docHeight = response.docHeight;
    screenshot.zoom = response.zoom;
    screenshot.startRecording();
  },

  isThisPlatform: function(operationSystem) {
    return navigator.userAgent.toLowerCase().indexOf(operationSystem) > -1;
  },

  executeScriptsInExistingTabs: function() {
    chrome.windows.getAll(null, function(wins) {
      for (var j = 0; j < wins.length; ++j) {
        chrome.tabs.getAllInWindow(wins[j].id, function(tabs) {
          for (var i = 0; i < tabs.length; ++i) {
            if (tabs[i].url.indexOf("chrome://") != 0) {
              chrome.tabs.executeScript(tabs[i].id, { file: 'js/gif_capture_page.js' });
            }
          }
        });
      }
    });
  },

  readSettings: function() {
    screenshot.MAX_TIME = parseInt(localStorage.maxDuration) || 15000;
    screenshot.QUALITY = parseInt(localStorage.quality) || 50;
    screenshot.FPS = parseInt(localStorage.fps) || 5;
  },

  startRecording: function() {
    screenshot.readSettings();
    chrome.browserAction.setBadgeText({'text': 'REC'});
    chrome.browserAction.setTitle({title: 'Stop recording.'});

    screenshot.processingWorker = new Worker("js/processingWorker.js");
    screenshot.isRecording = true;

    var previous_screenshot_timestamp = new Date().getTime();
    // Set up a timer to regularly get screengrabs
    screenshot.timer = setInterval(function() {
      chrome.tabs.captureVisibleTab(null, {quality: screenshot.QUALITY}, function(imageData) {
          if (imageData !== undefined){
            var ctx = screenshot.canvas.getContext("2d");
            var x = 0;
            var y = 0;
            var width = screenshot.canvas.width;
            var height = screenshot.canvas.height;
            var image = new Image();
            image.src = imageData;
            ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
            var imageData = ctx.getImageData(0, 0, width, height).data;
            var imarray = [];

            for(var i = 0; i < imageData.length; i++){
              imarray.push(imageData[i]);
            }
            var serializedImageData = imarray.join(',');
            console.log("add image attempt", new Date());
            var screenshot_timestamp = new Date().getTime();
            screenshot.processingWorker.postMessage({'cmd': 'addImage', 'serializedImageData':serializedImageData, 'frame_delay': screenshot_timestamp-previous_screenshot_timestamp });
            previous_screenshot_timestamp = screenshot_timestamp;
            console.log("add image complete", new Date());
            console.log("---------");
          }
      });
    }, 1000 / screenshot.FPS);

    // Set up a timer for stoping infinite gifs
    setTimeout(function() {
      if (screenshot.isRecording){
        screenshot.stopRecording();
      }
    }, screenshot.MAX_TIME);

  },

  stopRecording: function() {
    screenshot.isRecording = false;
    chrome.browserAction.setBadgeText({'text': "--%"});
    chrome.browserAction.setTitle({title: 'Stop processing.'});
    // Stop the timer
    clearInterval(screenshot.timer);

    screenshot.processingWorker.addEventListener('message', function(e) {
      var data = e.data;
      switch (data.cmd) {
        case 'progress':
          chrome.browserAction.setBadgeText({'text': data.progress + "%"});
          break;

        case 'processed':
          screenshot.binary_gif = data.gif;
          screenshot.imageDataBase_64 = 'data:image/gif;base64,'+encode64(screenshot.binary_gif);
          chrome.tabs.create({'url': 'show_gif.html'});
          screenshot.stopProcessing();
          break;
      };
    }, false);

    screenshot.isProcessing = true;
    var width = screenshot.canvas.width;
    var height = screenshot.canvas.height;
    screenshot.processingWorker.postMessage({'cmd': 'process', 'width': width, 'height': height, 'fps': screenshot.FPS});
  },

  stopProcessing: function() {
    screenshot.processingWorker.terminate();
    chrome.browserAction.setBadgeText({'text': ''});
    chrome.browserAction.setTitle({title: 'Start recording.'});
    screenshot.isProcessing = false;
    screenshot.isRecording = false;
  },

  init: function() {
    screenshot.readSettings();
    screenshot.executeScriptsInExistingTabs();
    screenshot.addMessageListener();
  }
};

screenshot.init();
