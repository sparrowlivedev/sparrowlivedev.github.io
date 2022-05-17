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
  this.ready(() => {
    var player = this;
    console.log('player ready!', player);
    onPlayerReady(player, videojs.mergeOptions(defaults, options));

    // Load video metadata
    player.on('loadstart',function(){
      console.log('loadstart! mediainfo: ', player.mediainfo);
    });

    // Play the video in the player
    player.on('loadedmetadata', function() {
      console.log('loadedmetadata! mediainfo: ', player.mediainfo);
      console.log('loadedmetadata! play video');
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
