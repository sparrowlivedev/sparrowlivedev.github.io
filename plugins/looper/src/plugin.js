import videojs from 'video.js';
import {version as VERSION} from '../package.json';

// Default options for the plugin.
const defaults = {};
const DEBUG_MODE = false;

var _options = {};
var _totalPlayCount = 0;
var _playCount = 0;

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;

function initOptions(opts) {
  _options = opts;
  _totalPlayCount = opts["playCount"] || 0;
  if (DEBUG_MODE) _totalPlayCount = 2;
}

function playVideo (player) {
  // Check the number of times the video has played
  if (_playCount < _totalPlayCount) {
    // Start video playback
    player.play();
    // Increment number of times video played
    _playCount++;
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
  player.addClass('vjs-looper');
  initOptions(options);

  player.on("ended", function () {
    playVideo(player);
  });

  playVideo(player);
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function looper
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const looper = function(options) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(defaults, options));
  });
};

// Register the plugin with video.js.
registerPlugin('looper', looper);

// Include the version number.
looper.VERSION = VERSION;

export default looper;
