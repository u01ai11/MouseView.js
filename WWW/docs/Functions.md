---
id: Functions
title: Controlling MouseView.js with methods
sidebar_label: Methods
---

This gives you an idea of the methods available on the *mouseview* object. For a summary of setting attributes checkout [Configuration.](Configuration.md)

## initiate the overlay 
```jsx
mouseview.init()
```

## Tracking 
To start recording mouse movements you use the following functions
```jsx
mouseview.startTracking() // this starts recording samples
mouseview.stopTracking() // this stops recording
```

Samples are stored in `mouseview.datalogger.data` as objects with `x`, `y`, `time` and `event` properties. `x` and `y` are in page pixels (so they include any scrolling), `time` is in milliseconds since `startTracking()`, and `event` is `'sample'` or the text you passed to `logEvent`. Before the mouse has moved, `x` and `y` are `null`.

## Local Storage
Mouseview.js allows you to store and retrieve data on the clients browser. This is helpful for tracking accross multiple pages, or presenting previous data on screen. The page path is stored alongside the data.

```jsx
// run this  before user navigates away
mouseview.storeData()

// then on a new page to retrieve
mouseview.getData()

// now the namespace contains the old data, and the path of the page it came from
console.log(mouseview.datalogger.data)
console.log(mouseview.datalogger.path)
```
## Core Methods 

The table below describes all available core methods 

| Method                          | Description                                                                                                                                                                                                     |
|---------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ``` mouseview.init() ```               | This function initiates the MouseView.js with the current settings.                                                                                                                                             |
| ``` mouseview.removeAll() ```          | This function removes the overlay and all the listeners MouseView.js added. You can call `init()` again afterwards.                                                                                             |
| ``` mouseview.startTracking() ```     | This starts the recording of the current mouse or touch coordinates, in intervals specified by the mouseview.timing.sampleRate variable.                                                                        |
| ``` mouseview.stopTracking() ```      | This stops all the recording.                                                                                                                                                                                   |
| ``` mouseview.logEvent(event_txt) ```  | A utility function that will log a string (event_txt) in the sample data, along with the current position and a timestamp, whenever it is called.                                                             |
| ``` mouseview.storeData() ```          | A utility function which stores all the current mousetracking data in the browser’s local storage, along with the current webpage path. It will overwrite any currently stored data.                            |
| ``` mouseview.getData() ```            | Retrieves any stored data into `mouseview.datalogger.data`, and its page path into `mouseview.datalogger.path`. Data stored by MouseView.js 0.1.x can still be read.                                           |
| ``` mouseview.clearData() ```          | Clear working data.                                                                                                                                                                                             |
| ``` mouseview.updateOverlayCanvas() ``` | Applies changed settings and the current window size to the overlay.                                                                                                                                           |
| ``` mouseview.checkSupport() ```       | Returns what the browser supports and which renderer `init()` would use with the current settings (`renderer` is `null` if the task cannot be shown). See [browser support](/docs#browser-support).           |
| ``` mouseview.requestTiltPermission() ``` | On iOS, asks for permission to use the motion sensors when `mobileTilt` is on. Call it from a button click, it returns a promise that resolves to `true` if tilt can be used.                              |
## Visualisation Methods

We also bundle in simpleheat.js, allowing you to plot data on the screen. This is used in the demo on this website. 

| Method                   | Description                                                   |
|--------------------------|---------------------------------------------------------------|
| ``` mouseview.plotHeatMap() ``` | Plot a heatmap of the data over the page.              |
| ``` mouseview.clearHeatMap() ``` | Clear the heatmap and remove the overlay.                     |
