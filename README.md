<img src="/WWW/static/img/logo-pink-txt-tight.svg" width="50%"/>
[![Netlify Status](https://api.netlify.com/api/v1/badges/fd61b195-4206-4b25-9308-a6b869ef99b2/deploy-status)](https://app.netlify.com/sites/mouseview-docs/deploys)
# MouseView.js
Attentional mouse tracking. Alternative to online eye tracking.

Documentation and updates are hosted on [MouseView.org](https://mouseview.org). 

The blur library is very much a work in progress, so please **don't use the gaussian blur in your own app, without conacting us**. You have been warned. The known problems are summarised in the issues on this repo.

Demo available [here](https://mouseview-docs.netlify.app/demo.html)

<img src="/WWW/static/img/example.gif" width="60%"/>


# Getting Started

## Install and setup
MouseView.js is designed to inject a layer over a webpage. Simply include the script on in your websites **body** tag.
 
The most up-to-date one is hosted on netlify:
```HTML
<script src="https://mouseview-docs.netlify.app/MouseView.js" type="module"></script>
```
or you can just download a version to your site and include it that way
```HTML
<script src="MouseView.js" type="module"></script>
```

or you can use it as an ES6 import in JavaScript
```jsx
import * as mouseview from "/MouseView.js";
mouseview.init()
```

You can also install it from npm into your app. 
```
npm install --save mouseviewjs
```
It also (experimentally) supports .mjs imports. But will throw an error if you run this outside a web browser (i.e. in an app or on a server). 

```jsx
import "/MouseView.js";
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

## Integration 

We are making efforts to have this library integrated into existing platforms and tools for online data collection. 

### jsPsych
The current working example is using jsPsych through the form of plugins. A start and stop plugins. 

A demo within a jsPsych experiment is available [here](https://mouseview.netlify.app/examples/jspsych/experiment.html)

You can also take a look at how this works in the [examples directory](/examples/jspsych/)

## Tracking 
To start recording mouse movements you use the following functions
```JavaScript
mouseview.startTracking() // this starts a record and logs timestamps in console
mouseview.stopTracking() // this stops and logs the data into the console 
```
The tracking data is stored in mouseviews namespace as an Array of objects with properties X, Y, time and event (for tracking data this is always 'sample'). Representing coordinates of the mouse on the viewport (not the page, relevant if scrolling is involved -- this will be updated in time), and the time in milliseconds from the recording start
```JavaScript
mouseview.datalogger.data // this is where the data is stored
```
We also provide a utility function for logging in arbirary event strings -- you can use this to log things like image loads, or trial initation. It also logs in the current mouse location and the current timestamp.

```JavaScript
mouseview.logEvent('Experiment Loaded')
```


You can also request a target interval for data storage in milliseconds. The default is 16.66ms, which is a frame refresh on a 60Hz monitor. This is dependent on the ability to flip a frame, so sometimes this may not be exact!

## Local Storage
Mouseview.js allows you to store and retrieve data on the clients browser. This is helpful for tracking accross multiple pages, or presenting previous data on screen. When you store data it appends that page path to the beginning of the data array. When you retrieve data it will append the path of the page to the end of data array, so you can tell the difference between site pages. 

```JavaScript
// run this  before user navigates away
mouseview.storeData() // this starts a record and logs timestamps in console

// then on a new page to retrieve
mouseview.getData()

// now the namespace contains all the old data, but with the old path name at the start, and the new one at the end 
console.log(mouseview.datalogger.data)

```




