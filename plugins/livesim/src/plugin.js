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

var _options = {};
var _livesimEnabled = false;
var _startTime = 0;
var _currentTime = new Date();

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

    });

    // Play the video in the player
    player.on('loadedmetadata', function() {
      console.log('loadedmetadata! setup video');
      player.currentTime(20);
      player.play();
    });
  });
};

// Register the plugin with video.js.
registerPlugin('livesim', livesim);

// Include the version number.
livesim.VERSION = VERSION;

export default livesim;
