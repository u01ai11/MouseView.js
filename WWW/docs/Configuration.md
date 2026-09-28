---
id: Configuration
title: Configuration Options
sidebar_label: Configuration
---

MouseView.js allows you to configure the overlay and aperture, this page gives you an overview of how to do this and what you can configure. 

Checkout [Functions](Functions.md) for an overview of the methods for controlling MouseView.js.

## Setting attributes

You can set multiple different attributes of the aperture and the overlay
```jsx title="Attributes Example"
// size of the aperture viewing window. This can be a percentage in a string or an integer in pixels
mouseview.params.apertureSize = '5%'

// the standard deviation (in pixels) of the gaussian filter applied to the edge of the aperture
mouseview.params.apertureGauss = 10 

// 'classic' draws the aperture exactly as MouseView.js 0.1.x did, 'clear' makes it fully clear (see below)
mouseview.params.apertureMode = 'classic'

// The colour of the overlay, this can be a colour word ('black', 'blue') or a hex string
mouseview.params.overlayColour = 'black' //i.e. hex black

// The opacity of the overlay, higher makes the content underneath less visible 
mouseview.params.overlayAlpha = 0.8 // how transparent the overlay will be

// The SD of the Gaussian blur applied to content underneath overlay 
mouseview.params.overlayGaussian = 20

// A callback function that runs once the overlay is in place, use it to start your task
mouseview.params.overlayGaussianFunc = () => { }

// What to do if the browser cannot draw the blur: 'fail', 'fallback' or 'allow' (see Quick Start, Browser support)
mouseview.params.blurUnsupported = 'fail'
```

If you change settings after `init()`, call `mouseview.updateOverlayCanvas()` to apply them.

## Aperture modes

In `'classic'` mode (the default) the overlay looks exactly as it did in MouseView.js 0.1.x, so results stay comparable with studies run on earlier versions. In this mode the aperture is not completely clear when `overlayAlpha` is above 0: the middle of the aperture keeps some of the overlay colour (about 30% at the default `overlayAlpha` of 0.8), and the overlay colour is cut back over a wider radius than the blur.

`'clear'` mode gives a single, fully clear aperture of diameter `apertureSize`, with a gaussian edge of `apertureGauss`. Use it for new studies that want the page to be fully visible inside the aperture.

## All attributes


| Setting                                  | Description                                                                                                                                 | Accepted Types                                           | Default                                   |
|------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|-------------------------------------------|
| **Aperture**                                 |                                                                                                                                             |                                                          |                                           |
| ```mouseview.params.apertureSize```           | Diameter of the viewing aperture in pixels, or as a percentage of the smaller of the window's width and height.                              | Number-Integer (pixels) or String (‘x%’)                 | ‘5%’                                      |
| ```mouseview.params.apertureGauss```           | Standard Deviation for Gaussian edge.                                                                                                       | Number-Integer (pixels)                                  | 10                                        |
| ```mouseview.params.apertureMode```            | How the aperture is drawn, see Aperture modes above.                                                                                        | ‘classic’ or ‘clear’                                     | ‘classic’                                 |
| **Overlay**                                  |                                                                                                                                             |                                                          |                                           |
| ```mouseview.params.overlayColour```           | Colour of overlay.                                                                                                                          | String containing CSS Keyword, hexadecimal, or HSL code. | ‘black’                                   |
| ```mouseview.params.overlayAlpha```            | Transparency of overlay.                                                                                                                    | Number-Decimal (0-1).                                    | 0.8                                       |
| ```mouseview.params.overlayGaussian```         | Standard Deviation for Gaussian blurring of the page under the overlay. 0 turns the blur off.                                               | Number-Integer (pixels)                                  | 20                                        |
| ```mouseview.params.overlayGaussianFunc```     | Function that will be run when the overlay is in place.                                                                                     | JavaScript arrow function. “() => {}”                    | () => {console.log('overlay generated')}  |
| ```mouseview.params.overlayGaussianInterval``` | Only used by the fallback renderer: millisecond interval for recapturing the page. 0 means it only recaptures when the window is resized.   | Number-Integer or Float (milliseconds)                   | 0                                         |
| **Browser support**                          |                                                                                                                                             |                                                          |                                           |
| ```mouseview.params.blurUnsupported```         | What to do when the browser cannot draw the blur.                                                                                           | ‘fail’, ‘fallback’ or ‘allow’                            | ‘fail’                                    |
| ```mouseview.params.blurUnsupportedMessage```  | Message shown when `blurUnsupported` is ‘fail’ and the blur cannot be drawn.                                                                | String                                                   | A request to use an up-to-date browser    |
| ```mouseview.params.onBlurUnsupported```       | Called with the result of `checkSupport()` (plus a `reason`) when the overlay cannot be shown.                                              | Function or null                                         | null                                      |
| ```mouseview.params.fallbackUrl```             | Where to load `MouseView-fallback.js` from.                                                                                                 | String (URL) or null                                     | Next to MouseView.js                      |
| **Recording**                                |                                                                                                                                             |                                                          |                                           |
| ```mouseview.timing.sampleRate```              | Desired target sample rate. Target because screen refreshes can be variable.                                                                | Number-Integer or Float (milliseconds)                   | 16.66 (one refresh at 60Hz)               |
