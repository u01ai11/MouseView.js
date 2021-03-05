---
id: Configuration
title: Configuration Options
sidebar_label: Configuration
---

## Settings

You can set multiple different attributes of the aperture and the overlay
```JavaScript
// size of the aperture viewing window. This can be a percentage in a string or an integer in pixels
mouseview.params.apertureSize = '5%'

// the standard deviation (in pixels) of the gaussian filter applied to the edge of the aperture
mouseview.params.apertureGauss = 10 

// The colour of the overlay, this can be a colour word ('black', 'blue') or a hex string
mouseview.params.overlayColour = 'black' //i.e. hex black

// The opacity of the overlay, higher makes the content underneath less visible 
mouseview.params.overlayAlpha = 0.8 // how transparent the overlay will be

// The SD of the Gaussian blur applied to content underneath overlay 
// This is experimental -- not consistent accross browsers and websites, and adds considerable time to the delay
mouseview.params.overlayGaussian = 20 // SD in pixels for the gaussian blur filter (experimental -- not consistent on browsers)

// A callback function can be passed into this argument, that will be run on the completion of the guassian blurring
// As this can take up to a couple of seconds, this is very hand to hide elements or to start events after the blurr is in place!
mouseview.params.overlayGaussianFunc = () => { }

// You can also pass in the number of ms you want to wait before manually recapturing the blur (you may want to do this for dynamic contennt in the page)
// if you pass zero it updates only on page resize or scroll events
mouseview.params.overlayGaussianInterval = 0
```


| Setting                                  | Description                                                                                                                                 | Accepted Types                                           | Default                                   |
|------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|-------------------------------------------|
| **Aperture**                                 |                                                                                                                                             |                                                          |                                           |
| ```mouseview.params.apertureSize```           | Size of the viewing aperture in pixels or percentage of screen width.                                                                       | Number-Integer (pixels) or                               | ‘5%’                                      |
|                                          |                                                                                                                                             |                                                          |                                           |
|                                          |                                                                                                                                             | String (‘x%’)                                            |                                           |
| ```mouseview.params.apertureGauss```           | Standard Deviation for Gaussian edge.                                                                                                       | Number-Integer (pixels)                                  | 10                                        |
| **Overlay**                                  |                                                                                                                                             |                                                          |                                           |
| ```mouseview.params.overlayColour```           | Colour of overlay.                                                                                                                          | String containing CSS Keyword, hexadecimal, or HSL code. | ‘black’                                   |
| ```mouseview.params.overlayAlpha```            | Transparency of overlay.                                                                                                                    | Number-Decimal (0-1).                                    | 0.8                                       |
| ```mouseview.params.overlayGaussian```         | Standard Deviation for Gaussian blurring of overlay.                                                                                        | Number-Integer (pixels)                                  | 20                                        |
| ```mouseview.params.overlayGaussianFunc```     | Function that will be run when the Gaussian overlay has been generated.                                                                     | JavaScript arrow function. “() => {}”                    | () => {console.log('overlay generated')}  |
| ```mouseview.params.overlayGaussianInterval``` | Millisecond Interval for the Gaussian blur overlay to be regenerated. Passing 0 means it will only update on window resize and page scroll. | Number-Integer or Float (milliseconds)                   | 0                                         |
| **Recording**                                |                                                                                                                                             |                                                          |                                           |
| ```mouseview.timing.sampleRate```              | Desired target sample rate. Target because timing can be screen refreshes can be variable.                                                  | Number-Integer or Float (milliseconds)                   | 16.66 (one refresh at 50Hz)               |