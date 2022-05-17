# videojs-livesim

Simulate a livestream experience when plugin is added to a Brightcove Player

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [Usage](#usage)
  - [`<script>` Tag](#script-tag)
  - [Browserify/CommonJS](#browserifycommonjs)
  - [RequireJS/AMD](#requirejsamd)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
## Installation

```sh
npm install --save videojs-livesim
```

## Usage

To include videojs-livesim on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-livesim.min.js"></script>
<script>
  var player = videojs('my-video');

  player.livesim();
</script>
```

### Browserify/CommonJS

When using with Browserify, install videojs-livesim via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-livesim');

var player = videojs('my-video');

player.livesim();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-livesim'], function(videojs) {
  var player = videojs('my-video');

  player.livesim();
});
```

## License

UNLICENSED. Copyright (c) Meghan Smyth


[videojs]: http://videojs.com/
