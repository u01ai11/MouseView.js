---
id: PsychoJS-PsychoPy
title: Running MouseView.js experiment using PsychoJS-PsychoPy
sidebar_label: PsychoPy-PsychoJS
---
The PsychoPy Builder is a free tool to create experiments that can also write your experiment to JavaScript (PsychoJS) to run online. You can download PsychoPy here: [psychopy.org](https://www.psychopy.org/download.html). Most PsychoPy experiments are hosted online using pavlovia.org [pavlovia.org](https://pavlovia.org/)

Let's talk through how to get your MouseView.js experiment up and running using PsychoPy. 

# Fork a demo
A template of mouseview is already available for you to use and adapt here https://run.pavlovia.org/demos/mouseview_demo and the files can be accessed here https://gitlab.pavlovia.org/demos/mouseview_demo

To use it, sign into your pavlovia.org account (if you don't have one you can sign up for one for free). Go to https://gitlab.pavlovia.org/demos/mouseview_demo and select the "fork" icon, when it asks you what "namespace" you want to fork to select your username - now you have your own copy ready to use on pavlovia!

# Edit the demo using PsychoPy Builder 
OK so now you have a copy, you probably want to make edits. Be aware that this demo was made in a 2021 release of PsychoPy, so if you are running an older version you might need to update first. Once in builder, select the "search" icon (central globe with a magnifying glass on the toolbar). Look for "mouseview_demo" saved under your username and select "Sync".

Now you have a copy of the mouseview demo to build on yourself! (the changes that you make to this copy will not affect the original repository)

# Make your edits!
This demo is a spin off of the dynamic_selective_inspect demo in pavlovia https://run.pavlovia.org/demos/dynamic_selective_inspect/html/ which does something similar, but less cool. With mouseview you can dynamically manipulate the parameters of your mask in a much more flexible way. 

## General settings

Before our search trial, the general settings for each parameter are initialized in the "init_mouseview_trial" routine. The parameters are set in the are set in the "init_mouse_view_code" code component as follows:

```jsx
// Settings for mouseview
mouseview.params.overlayColour = '#fff'; //String containing CSS Keyword, hexadecimal, or HSL code.
mouseview.params.overlayAlpha = alphaLevel; //Number-Decimal (0-1). this can be a number but in this demo we change the value trial by trial from a conditions file
mouseview.params.overlayGaussian = blur; //Number-Integer (pixels)// again we are setting this using a conditions file on each trial
mouseview.params.overlayGaussianInterval = 1000; //Number-Integer or Float (milliseconds)
mouseview.timing.sampleRate = 16.66; //Number-Integer or Float (milliseconds) PLEASE NOTE THIS IS DEPENDANT ON THE REFRESH RATE OF THE MONITOR
mouseview.params.overlayGaussianFunc = ()=> {cover.hide(); continueRoutine = false};// remove the cover and end the routine when the overlay has been initialized
mouseview.params.apertureSize = '10%'; // Number-Integer (pixels) or String (‘x%’)
mouseview.params.apertureGauss = 10; //Number-Integer (pixels)
// initiate the overlay 
mouseview.init();
````

For more information on each parameter, see the mouseview article itself. This code is also preceeded by code in which a "cover" is generated to block the scene whilst the overlay is being created, preventing any sneak previews of your stimuli:

```jsx 
if ((trialCount === 0)) {//only make a cover on the first trial
    var cover = document.createElement("div"); 
    cover.style.cssText = "background: #808080; position: fixed; bottom: 0; right: 0; left: 0; top: 0";//this sets the color of the cover
    cover.setAttribute('data-html2canvas-ignore','true')
    cover.id = 'cover'
    document.body.append(cover)
}
var cover =$('#cover')
cover.show()
```

## When the trail starts

In the mouseview_trial itself there are some snippets of code of iterest in the "mouseview_code" code component

At the begining of the routine we start the tracking:

```jsx
// Start recording
mouseview.startTracking();
```
Note, if you are just interested in mouse coordinates you can set "save mouse state" in mouseview_mouse to everyframe. In the end routine tab:

```jsx
mouseview.stopTracking();//stop the tracking
mouseview.removeAll();//remove the mouseview overlays
psychoJS.experiment.addData('mouseview', mouseview.datalogger.data);// save the data to the output file
```

The routine is currently set to end on a click (because of the settings in the mouseview_mouse). 


## Changing mouseview parameters trial-by-trial

In the demo, alpha and blur are manipulated from a conditions file by having a column called "blur" and a column called "alphaLevel", in theory, this should be possible for any parameter of mouseview enabling the manipulation of viewing conditions on a trial-by-trial basis (for example to gradually increase task difficulty!). 