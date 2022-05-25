import videojs from 'video.js';
import {version as VERSION} from '../package.json';

// Default options for the plugin.
const defaults = {};

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;

// URL for Brightcove's Video and Playlist APIs
const DEBUG_MODE = false;
const BC_BASE_URL = "https://edge.api.brightcove.com/playback/v1/accounts/6200858053001/";
const videoURL = "videos/${videoId}";
const playlistURL = "playlists/${playlistId}";
const STREAM_STATES = {
  "disabled": 0,
  "pre": 1,
  "live": 2,
  "post": 3,
}

var _options = {};
var _livesimEnabled = false;
var _streamState = 0;
var _streamStart = 0;
var _streamEnd = 0;
var _pageloadDateTime = new Date();
var _streamDuration = 0;

function initOptions(options) {
  if (typeof options === "object") {
    _options["preLive"] = options["preLive"];
    _options["featureTag"] = options["featureTag"];
    _options["postLive"] = options["postLive"];
  } else if (DEBUG_MODE) {
    _options["preLive"] = { "message": "Live in: ", "showCountdown": 1 };
  } else {
    console.log("Options object is not a proper Javscript object {} (JSON).");
  }
}

function initStreamState(startTime, currentTime, endTime) {
  // Pre
  if (startTime > currentTime)
    _streamState = STREAM_STATES["pre"];
  // Live
  else if (startTime <= currentTime && endTime > currentTime)
    _streamState = STREAM_STATES["live"];
  // Post
  else if (endTime <= currentTime)
    _streamState = STREAM_STATES["post"];

  else console.log("Invalid Date set for endTime", endTime);
}

function showCountdown(player, countdownTime) {
  if (!("preLive" in _options) || !("showCountdown" in _options["preLive"]) ||
      ("preLive" in _options && "showCountdown" in _options["preLive"] && !_options.preLive.showCountdown)) {
    console.log("showCountdown disabled");
    return;
  }

  // Build countdown overlay
  var countdownOverlay = document.createElement('div');
  countdownOverlay.className = 'vjs-countdown-overlay';

  var countdownLabel = document.createElement('div');
  countdownLabel.className = 'vjs-countdown-label';

  var countdownValue = document.createElement('div');
  countdownValue.className = 'vjs-countdown-value';

  if ("message" in _options.preLive) {
    console.log(_options.preLive.message);
    countdownLabel.innerHTML = _options.preLive.message;

    var intId = setInterval(function() {
      countdownTime--;
      if (countdownTime <= 0) {
        clearInterval(intId);
        player.el().removeChild(player.el().lastChild);
        livestreamVideo(player);
      } else {
        countdownValue.innerHTML = formatCountdownString(countdownTime);
      }
    }, 1000);
  } else {
    console.log("No preLive message provided.")
    countdownLabel.innerHTML = "The performance will go live in the future.";
  }
  
  // Display countdown overaly
  countdownOverlay.appendChild(countdownLabel);
  countdownOverlay.appendChild(countdownValue);
  player.el().appendChild(countdownOverlay);
}

function formatCountdownString(seconds) {
  console.log("formatCountdownString", seconds);
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600*24));
  var h = Math.floor(seconds % (3600*24) / 3600);
  var m = Math.floor(seconds % 3600 / 60);
  var s = Math.floor(seconds % 60);
  
  var dDisplay = d > 0 ? d + (d == 1 ? "  day  " : "  days  ") : "";
  var hDisplay = (d > 0 || h > 0) ? h + (h == 1 ? "  hour  " : "  hours  ") : "";
  var mDisplay = ((d + h > 0) || m > 0) ? m + (m == 1 ? "  minute  " : "  minutes  ") : "";
  var sDisplay = ((d + h + m > 0) || s >= 0) ? s + (s == 1 ? "  second" : "  seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

function showLiveControls(player) {
  console.log("SHOW LIVE CONTROLS");
  player.addClass("vjs-live");
  toggleClickToPause(player, false);
  if (player.controlBar) {
    player.controlBar.playToggle.hide();
    player.controlBar.progressControl.hide();
  } else console.log("Player does not have expected controlBar.")
}

function hideLiveControls(player) {
  console.log("HIDE LIVE CONTROLS");
  player.duration(_streamDuration);
  player.removeClass("vjs-live");
  toggleClickToPause(player, true);
  if (player.controlBar) {
    player.controlBar.playToggle.show();
    player.controlBar.progressControl.hide();
  } else console.log("Player does not have expected controlBar.")
}

function toggleHoverToControl(player, turnOn=false) {
  // Allow/disallow hovering the video player element to show controls
  var val = turnOn ? "" : "none";
  player.el_.style.pointerEvents = val;
  console.log("toggleHoverToControl", turnOn);
}

function toggleClickToPause(player, turnOn=false) {
  // Allow/disallow clicking the video player element to pause/play the video
  var val = turnOn ? "" : "none";
  player.el_.firstChild.style.pointerEvents = val;
  console.log("toggleClickToPause", turnOn);
}

function toggleBigPlayButton(player, show=false) {
  if (show) player.bigPlayButton.show();
  else player.bigPlayButton.hide();
  console.log("toggleBigPlayButton", show);
}

function updateLiveTime(player, videoTimeStamp) {
  if (player.liveTracker) {
    var runningTime = player.liveTracker.pastSeekEnd_;
    player.currentTime(videoTimeStamp + runningTime);
  } else {
    console.log("Player does not have expected liveTracker component.");
    player.currentTime(videoTimeStamp);
  }
}

function resetForVOD(player) {
  console.log("Stream ended! Resetting for VOD");
  hideLiveControls(player);
  toggleBigPlayButton(player, true);
  player.currentTime(0);
}

function livestreamVideo(player) {
  console.log("Stream State: LIVE");
  player.duration(Infinity);

  var pageloadVideoTime = (_pageloadDateTime - _streamStart) / 1000; // seconds
  if (DEBUG_MODE) pageloadVideoTime = 16;

  toggleHoverToControl(player, true);
  toggleBigPlayButton(player, true);

  player.on("play", function() {
    updateLiveTime(player, pageloadVideoTime);
    player.liveTracker.stopTracking();
    showLiveControls(player);
    toggleBigPlayButton(player, false);
  });

  player.on("ended", function() {
    resetForVOD(player);
  });

  player.play();
}

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 *           A Video.js player object.
 *
 * @param    {Object} [options={}]
 *           A plain object containing options for the plugin.
 */
const onPlayerReady = (player, options) => {
  player.addClass('vjs-livesim');
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function livesim
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */

const livesim = function(options) {

  initOptions(options);
  console.log(_options);

  this.ready(() => {
    var _player = this;

    onPlayerReady(_player, videojs.mergeOptions(defaults, options));

    // Load video metadata
    _player.on('loadstart',function(){
      var metadata = _player.mediainfo || {};
      toggleClickToPause(_player, false);
      toggleHoverToControl(_player, false);
      toggleBigPlayButton(_player, false);

      // Check for the featureTag. Without this, we don't proceed with the plugin.
      _livesimEnabled = metadata.tags && metadata.tags.includes(_options["featureTag"]);
      console.log("_livesimEnabled", _livesimEnabled);

      if (_livesimEnabled || DEBUG_MODE) {
        // set stream duration
        _streamDuration = metadata.duration || 0;

        // set time and current state
        _streamStart = new Date(metadata.customFields && (metadata.customFields.premiere_time || ""));
        if (DEBUG_MODE) {
          console.log("INIT DATES");
          _streamStart = new Date(_pageloadDateTime.getTime() + 3000);
          _streamDuration = 120;
          console.log("_streamStart", _streamStart);
        }
        _streamEnd = new Date(_streamStart.getTime() + (_streamDuration * 1000));
        initStreamState(_streamStart, _pageloadDateTime, _streamEnd);

      } else {
        console.log("livesim not enabled");
      }

    });

    // Play the video in the player
    _player.on('loadedmetadata', function() {
      if (DEBUG_MODE) _streamState = 1;
      switch(_streamState) {
        case 1:
          console.log("Stream State: PRE");
          toggleClickToPause(_player, false);
          toggleHoverToControl(_player, false);
          toggleBigPlayButton(_player, false);

          var timeTilLive =  (_streamStart - _pageloadDateTime.getTime()) / 1000; // seconds
          if (DEBUG_MODE) console.log("showCountdown", timeTilLive);
          showCountdown(_player, timeTilLive);
          break;
        case 2:
          livestreamVideo(_player);
        case 3:
          console.log("Stream State: POST");
          toggleClickToPause(_player, true);
          toggleBigPlayButton(_player, true);
          break;
        default:
          console.log("Stream State: DISABLED");
      }
    });
  });
};

// Register the plugin with video.js.
registerPlugin('livesim', livesim);

// Include the version number.
livesim.VERSION = VERSION;

export default livesim;
