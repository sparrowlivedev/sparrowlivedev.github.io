import videojs from 'video.js';
import {version as VERSION} from '../package.json';

// Default options for the plugin.
const defaults = {};

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;

// URL for Brightcove's Video and Playlist APIs
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
var _pageloadVideoTime = 0;

function setOptions(options) {
  if (typeof options === "object") {
    _options["displayText"] = options["displayText"];
    _options["preLive"] = options["preLive"];
    _options["featureTag"] = options["featureTag"];
    _options["postLive"] = options["postLive"];
  } else {
    console.log("Options object is not a proper Javscript object {} (JSON).");
  }
}

function setStreamState(startTime, currentTime, endTime) {
  console.log("setStreamState");
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
  console.log("_streamState", _streamState);
}

function showLiveControls(player) {
  console.log("SHOW LIVE CONTROLS");
  player.duration(Infinity);
  player.addClass("vjs-live");
  if (player.controlBar) {
    player.controlBar.playToggle.hide();
    player.controlBar.progressControl.hide();
  } else console.log("Player does not have expected controlBar.")
}

function hideLiveControls(player) {
  console.log("HIDE LIVE CONTROLS");
  player.duration(_streamDuration);
  player.removeClass("vjs-live");
  if (player.controlBar) {
    player.controlBar.playToggle.show();
    player.controlBar.progressControl.hide();
  } else console.log("Player does not have expected controlBar.")
}

function toggleClickToPause(player, turnOn=false) {
  // Allow/disallow clicking the video player element to pause/play the video
  var val = turnOn ? "none" : "";
  player.el_.firstChild.style.pointerEvents = val;
}

function updateLiveTime(player) {
  if (player.liveTracker) {
    var runningTime = player.liveTracker.pastSeekEnd_;
    return _pageloadVideoTime + runningTime;
  } else {
    console.log("Player does not have expected liveTracker component.");
    return _pageloadVideoTime;
  }
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

  // Display countdown overlay
  var textDisplay = document.createElement('p');
  textDisplay.className = 'vjs-text';
  if ('displayText' in options) {
    textDisplay.innerHTML = options.displayText;
  } else {
    textDisplay.innerHTML = "Default placeholder text";
  }
  player.el().appendChild(textDisplay);
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

  setOptions(options);
  console.log(_options);

  this.ready(() => {
    var player = this;
    console.log('player ready!', player);

    onPlayerReady(player, videojs.mergeOptions(defaults, options));

    // Load video metadata
    player.on('loadstart',function(){
      console.log('loadstart! mediainfo: ', player.mediainfo);
      var metadata = player.mediainfo || {};

      // Check for the featureTag. Without this, we don't proceed with the plugin.
      _livesimEnabled = metadata.tags && metadata.tags.includes(_options["featureTag"]);
      console.log("_livesimEnabled", _livesimEnabled);

      if (_livesimEnabled) {
        // Set stream duration
        _streamDuration = metadata.duration || 0;

        // Set time and current state
        _streamStart = new Date(metadata.customFields && (metadata.customFields.premiere_time || ""));
        _streamEnd = new Date(_streamStart.getTime() + (_streamDuration * 1000));
        console.log("_streamDuration", _streamDuration);
        console.log("_streamStart", _streamStart);
        console.log("_streamEnd", _streamEnd);
        console.log("_pageloadDateTime", _pageloadDateTime);
        setStreamState(_streamStart, _pageloadDateTime, _streamEnd);

      } else {
        console.log("livesim not enabled");
      }

    });

    // Play the video in the player
    player.on('loadedmetadata', function() {
      console.log('loadedmetadata! setup video');

      switch(_streamState) {
        case 1:
          console.log("Stream State: PRE");
          break;
        case 2:
          console.log("Stream State: LIVE");
          _pageloadVideoTime = Math.floor((_pageloadDateTime - _streamStart) / 1000); // seconds
          console.log("_pageloadVideoTime", _pageloadVideoTime);

          // Show live playback bar
          showLiveControls(player);
          updateLiveTime(player);
          player.play();
          break;
        case 3:
          console.log("Stream State: POST");
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
