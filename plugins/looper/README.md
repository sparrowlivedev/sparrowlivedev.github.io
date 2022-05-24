<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [videojs-looper](#videojs-looper)
  - [Installation](#installation)
  - [Usage](#usage)
    - [`<script>` Tag](#script-tag)
    - [Browserify/CommonJS](#browserifycommonjs)
    - [RequireJS/AMD](#requirejsamd)
  - [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# videojs-looper

Automatically loop a video in this player

## Installation

```sh
npm install --save videojs-looper
```

## Usage

To include videojs-looper on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-looper.min.js"></script>
<script>
  var player = videojs('my-video');

  player.looper();
</script>
```

### Browserify/CommonJS

When using with Browserify, install videojs-looper via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-looper');

var player = videojs('my-video');

player.looper();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-looper'], function(videojs) {
  var player = videojs('my-video');

  player.looper();
});
```

## License

UNLICENSED. Copyright (c) Meghan Smyth


[videojs]: http://videojs.com/
