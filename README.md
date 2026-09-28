<img src="/WWW/static/img/logo-pink-txt-tight.svg" width="50%"/>

# MouseView.js
Attentional mouse tracking. Alternative to online eye tracking.

Documentation and updates are hosted on [MouseView.org](https://mouseview.org). Current site status: [![Netlify Status](https://api.netlify.com/api/v1/badges/fd61b195-4206-4b25-9308-a6b869ef99b2/deploy-status)](https://app.netlify.com/sites/mouseview-docs/deploys)

Demo available [here](https://mouseview.org/demo.html)

Details and validation published in Behavior Research Methods [here](https://doi.org/10.3758/s13428-021-01703-5)

If you use this tool please cite:

```Anwyl-Irvine, A. L., Armstrong, T., & Dalmaijer, E. S. (2021, September 29). MouseView.js: Reliable and valid attention tracking in web-based experiments using a cursor-directed aperture. Behavior Research Methods, https://doi.org/10.3758/s13428-021-01703-5```

<img src="/WWW/static/img/example.gif" width="60%"/>

See [CHANGELOG.md](CHANGELOG.md) for what changed in each version. Version 0.2.0 replaced the screenshot-based blur with a CSS overlay, see [Browser support](#browser-support).

# Getting Started

## Install and setup
MouseView.js is designed to inject a layer over a webpage. Include the script on your page:

```HTML
<script src="https://mouseview.org/MouseView.js"></script>
```
or download `MouseView.js` (and `MouseView-fallback.js`) to your site and include it that way
```HTML
<script src="MouseView.js"></script>
```

You can also install it from npm into your app. 
```
npm install --save mouseviewjs
```
and use it as an ES module (it only works in a web browser):
```jsx
import * as mouseview from "mouseviewjs"; // or "./MouseView.mjs"
mouseview.init()
```


Once it is included it adds the mouseview object to the global namespace, you can set various parameters there, and initiate the overlay
```JavaScript
// set some parameters
mouseview.params.apertureSize = 100
mouseview.params.overlayColour = '#17202A' //i.e. hex black
mouseview.params.overlayAlpha = 0.99

// initiate the overlay 
mouseview.init()

```

## Settings

You can set multiple different attributes of the aperture and the overlay
```JavaScript
// size of the aperture viewing window. This can be a percentage in a string or an integer in pixels
mouseview.params.apertureSize = '5%'

// the standard deviation (in pixels) of the gaussian filter applied to the edge of the aperture
mouseview.params.apertureGauss = 10 

// 'classic' (default) draws the aperture exactly as MouseView.js 0.1.x did, 'clear' makes it fully clear
mouseview.params.apertureMode = 'classic'

// The colour of the overlay, this can be a colour word ('black', 'blue') or a hex string
mouseview.params.overlayColour = 'black' //i.e. hex black

// The opacity of the overlay, higher makes the content underneath less visible 
mouseview.params.overlayAlpha = 0.8 // how transparent the overlay will be

// The SD of the Gaussian blur applied to content underneath overlay, 0 for no blur
mouseview.params.overlayGaussian = 20

// A callback function that runs once the overlay is in place, use it to start your task
mouseview.params.overlayGaussianFunc = () => { }

// What to do if the browser cannot draw the blur: 'fail' (default), 'fallback' or 'allow', see below
mouseview.params.blurUnsupported = 'fail'
```

## Browser support

The overlay is drawn with the CSS `backdrop-filter` and `mask-image` properties. The page underneath stays live (videos, animations and changes to the page are blurred as they happen, including cross-origin iframes), scrolling costs nothing, and there is no screenshot to wait for. These are supported by current versions of Chrome, Edge, Firefox and Safari.

A participant is never silently shown an unblurred page. If their browser cannot draw the blur, `mouseview.params.blurUnsupported` decides what happens:

- `'fail'` (default): a message is shown (`blurUnsupportedMessage`), `onBlurUnsupported(info)` is called, and `overlayGaussianFunc` is never called, so the task does not start.
- `'fallback'`: `MouseView-fallback.js` is loaded from next to `MouseView.js` (or `params.fallbackUrl`) and the blur is drawn from a screenshot of the page, with the same canvas drawing as MouseView.js 0.1.x. It is slower and does not follow changes to the page between recaptures (`overlayGaussianInterval`).
- `'allow'`: carry on without blur. Only use this when the blur is not part of your stimulus.

`mouseview.checkSupport()` tells you in advance which renderer would be used (`renderer` is `null` if the task cannot be shown), and `mouseview.datalogger.renderer` records the renderer used, so you can report or exclude it.

In `'classic'` mode the overlay matches MouseView.js 0.1.x. `test/parity.html` checks this against the original canvas drawing over a range of settings. Note that in this mode the aperture is not completely clear when `overlayAlpha` is above 0 (about 30% of the overlay colour remains in its centre at the default 0.8). Use `apertureMode = 'clear'` for a fully clear aperture.

## Integration 

We are making efforts to have this library integrated into existing platforms and tools for online data collection. 

### jsPsych
MouseView.js works with jsPsych through a start and a stop plugin.

- jsPsych 7 and 8: [jspsych/plugin-mouseview-start.js](jspsych/plugin-mouseview-start.js) and [jspsych/plugin-mouseview-stop.js](jspsych/plugin-mouseview-stop.js), example [here](https://mouseview.org/examples/jspsych/experiment-v8.html)
- jsPsych 6: [examples/jspsych](examples/jspsych/), example [here](https://mouseview.org/examples/jspsych/experiment.html)

## Tracking 
To start recording mouse movements you use the following functions
```JavaScript
mouseview.startTracking() // this starts recording
mouseview.stopTracking() // this stops recording
```
The tracking data is stored in mouseviews namespace as an Array of objects with properties x, y, time and event (for tracking data this is always 'sample'). x and y are the mouse position on the page in pixels (they include any scrolling, and are `null` before the mouse has moved), and time is in milliseconds from the recording start.
```JavaScript
mouseview.datalogger.data // this is where the data is stored
```
We also provide a utility function for logging in arbirary event strings -- you can use this to log things like image loads, or trial initation. It also logs in the current mouse location and the current timestamp.

```JavaScript
mouseview.logEvent('Experiment Loaded')
```


You can also request a target interval for data storage in milliseconds. The default is 16.66ms, which is a frame refresh on a 60Hz monitor. This is dependent on the ability to flip a frame, so sometimes this may not be exact!

## Local Storage
Mouseview.js allows you to store and retrieve data on the clients browser. This is helpful for tracking accross multiple pages, or presenting previous data on screen. The page path is stored with the data.

```JavaScript
// run this  before user navigates away
mouseview.storeData()

// then on a new page to retrieve
mouseview.getData()

// now the namespace contains the old data, and the page it came from
console.log(mouseview.datalogger.data)
console.log(mouseview.datalogger.path)
```

# Development

Edit the files in the repository root (`MouseView.js`, `MouseView-fallback.js`, `MouseView.mjs`, `jspsych/`, `examples/`, `test/`), then run `npm run build` to copy them into the docs site (`WWW/static`). To check the overlay still matches the original drawing, serve `WWW/static` (for example `python3 -m http.server`) and open `/test/parity.html`.
