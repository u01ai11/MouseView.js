# MouseView.js
Attentional mouse tracking. Alternative to online eye tracking.

This is very much a work in progress, so please **don't use this in production** yet. You have been warned.

Demo available [here](https://mouseview.netlify.app)

<img src="/resources/mouseview_demo.gif" width="350"/>


# Getting Started

## Install and setup
MouseView.js is designed to inject a layer over a webpage. Simply include the script on in your websites **body** tag.
 
The most up-to-date one is hosted on netlify:
```HTML
<script src="https://mouseview.netlify.app/MouseView.js" type="module"></script>
```
or you can just download a version to your site and include it that way
```HTML
<script src="MouseView.js" type="module"></script>
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

## Tracking 
To start recording mouse movements you use the following functions
```JavaScript
mouseview.startRecording() // this starts a record and logs timestamps in console
mouseview.stopRecording() // this stops and logs the data into the console 
```
The tracking data is stored in mouseviews namespace as an Array of objects with properties X, Y and time. Representing coordinates of the mouse on the viewport (not the page, relevant if scrolling is involved -- this will be updated in time), and the time in milliseconds from the recording start

```JavaScript
mouseview.datalogger.data
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




