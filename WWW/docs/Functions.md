---
id: Functions
title: Controlling MouseView.js with methods
sidebar_label: Methods
---

This gives you an idea of the methods available on the *mouseview* object. For a summary of setting attributes chekout [document](Functions.md)

## initiate the overlay 
```jsx
mouseview.init()
```

## Tracking 
To start recording mouse movements you use the following functions
```jsx
mouseview.startRecording() // this starts a record and logs timestamps in console
mouseview.stopRecording() // this stops and logs the data into the console 
```

## Local Storage
Mouseview.js allows you to store and retrieve data on the clients browser. This is helpful for tracking accross multiple pages, or presenting previous data on screen. When you store data it appends that page path to the beginning of the data array. When you retrieve data it will append the path of the page to the end of data array, so you can tell the difference between site pages. 

```jsx
// run this  before user navigates away
mouseview.storeData() // this starts a record and logs timestamps in console

// then on a new page to retrieve
mouseview.getData()

// now the namespace contains all the old data, but with the old path name at the start, and the new one at the end 
console.log(mouseview.datalogger.data)
