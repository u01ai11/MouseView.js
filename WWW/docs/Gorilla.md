---
id: Gorilla
title: Running MouseView.js experiment on Gorilla
sidebar_label: Gorilla
---
The Gorilla Experiment Builder is a fully tooled platform that deals wih every aspect of experiment design and hosting through a GUI. You can sign up for Gorilla here: [Gorilla.sc](https://www.gorilla.sc/?utm_medium=referral&utm_source=MouseView.js).

Using Gorilla is the quickest and easiest way to get your MouseView.js experiment up and running. 

# Task Builder
The Task builder is where the MouseView.js script is configured and installed. There are two ways to do this, using a drag and drop zone (the easiest), or using the script tab (less easy). 


## Drag and Drop Zone

Currently a drag and drop zone is under development. It's available on Gorilla via their [contact form](https://app.gorilla.sc/support/contactform). The documentation for this zone is available [here](https://support.gorilla.sc/support/reference/task-builder-zones#mousetrackingzonebeta) and also below. 

---

[Try out a Mouse View Zone Example](https://app.gorilla.sc/admin/task/241912/editor)

---

### Setting up the MouseView Zone

1. Upload a background stimuli to your screen then place the MouseView Zone on each of your Task Screens where you wish to use mouse view.

1. Edit Configuration settings of the MouseView Zone - see details below.

1) **Use the (setting) mode.**

Setting (record or upload : Type either 'record' or 'upload' to choose the operation mode for the Zone.
Default = record; If no mode is set the MouseView Zone will default to the 'record' mode. 

**Record**: In record mode the MouseView Zone will record participant video and return the recorded video to the MouseView Zone Metrics.

**Upload**: You only need to use upload if you want to upload on at, say, the end of a task or end of a block. Otherwise, use the Continue Recording setting instead.

---

2) **Prefix filename with (setting) for captured data** 

Setting (text): Type a name to identify the mouse tracking data file.

Default = mouseview; By default, the MouseView Zone will produce data with the filename mouseview-1-3, or similar.

When set to any text, this changes the filename of the MouseView data i.e. if set to 'MouseTask', the file might be named 'MouseTask-1-3'.

*Note: Only use alpha-numeric characters in your file names. Do not use special characters as this could prevent you from retrieving data files.*

---

3) **If (setting) continue recording after the end of this screen.**

Only set this if you are recording data across multiple screens, and ensure that the last screen does not have this set. 
Choose 1 (continue recording) or 0 (stop recording). 
Default: 0

---

### Mouseview Zone Settings

---

1) **Overlay Colour: (setting).**

Enter the colour for the overlay as a colour name or hexcode. Default: black

---

2) **Overlay Alpha: (setting).**

Enter the alpha (transparency) value for the overlay as a float between 0.0 and 1.0. Default: 0.8

---

3) **Overlay Gaussian Blur: (setting) pixels.**

Enter the standard deviation, as a number of pixels, for the Gaussian Blur. Higher numbers = more blur. Default: 20

---

4) **Aperture Size: (setting) % of screen space.**

Enter the size of the viewing aperture as a number representing percentage of screen. Default: 5 (i.e. 5%)

---

Click to view an [Example](https://app.gorilla.sc/admin/task/241912/editor) of a simple **Task** which makes use of the MouseView Zone.

---

## Task Builder Script

:::caution 
This assumes you to know a bit of JavaScript, if you are new to this please check out Gorilla's tutorials on Task Builder scripting first. 
:::

To activate the overlay, track across a single screen, and pip in data there are several elements that need to be included in your Script tab. 

### General settings

It's often easy to specify variables at the start of your script, so they are referred to later. It's easy to change them.

Let's specify our mouseview settings:
```jsx
//Settings for mouseview
var aperture_size = "5%" // the size of the viewing aperture
var overlay_colour = 'black' // the colour of the overlay
var overlay_alpha = 0.0 // how transparent the overlay is (0 = clear, 1 = solid)
var overlay_blur = 30 // the SD of the gaussuan blur (higher = blurrier)
````

And also a list of displays we want to use the MouseView plugin on, and the index of the screen in these displays which we want everything to happen on.

```jsx
//settings for your Gorilla task
var displays = ['trial', 'practice'] // what displays are we using mouseview on
var screens = [2] // in these displays what screens are blurred
```

Gorilla gives us hooks that run everytime given events happen. We use these to setup, start and stop MouseView.js. We use two here, OnScreenStart and OnScreenFinish

### On Screen Start

There are several things you need to do at the start of a screen. So we use this hook. It has the form:

```jsx
gorillaTaskBuilder.onScreenStart((spreadsheet: any, rowIndex: number, screenIndex: number, row: any, container: string) => {
    //stuff happens here.
})
```

All the code in this subsection is placed within this hook. 

### Hiding Cover
If you are using the Gaussuan Blur overlay, you will need to hide everything on screen whilst it loads. This avoids previewing the trial in full before the blur layer is draw. We only need to create this overlay once and then use .show() and .hide() to use it. 

Below we use rowIndex == 0 conditional to create this overlay on the first trial. 

```jsx 
    if(rowIndex == 0){
        //create cover screen that we use to hide contents until mouseview is ready
        var cover = document.createElement("div"); 
        cover.style.cssText = "background: #fff; position: fixed; bottom: 0; right: 0; left: 0; top: 0";
        cover.setAttribute('data-html2canvas-ignore','true')
        cover.id = 'cover'
        document.body.append(cover)
        var cover =$('#cover')
        cover.hide()
        
    }
```

### On MouseView.js displays

If this display is one we want to use MouseView.js on, and the screen is at the correct index, then we can start loading the script and hiding things. Read the comment lines in the code below for more details. 

```jsx
  if (displays.includes(row.display)){ // if we are on one of mouseview displays
    
        if (screens.includes(screenIndex)){ // if we are on one of our blurred screens
            
            // hide contents while we take a screenshot
            var cover =$('#cover')
            cover.show()
            
            // get the webgazer script 
            var script = document.createElement('script');
            
            // onload set the parameters 
            // here we pipe in the settings specified above
            script.onload = function () {
                mouseview.params.overlayColour = overlay_colour 
                mouseview.params.overlayAlpha = overlay_alpha 
                mouseview.params.overlayGaussian = overlay_blur 
                mouseview.params.apertureSize = aperture_size
                mouseview.params.overlayGaussianFunc = () => {
                    var cover =$('#cover')
                    cover.hide()
                }
                $.when(mouseview.init()).then(() => {
                    mouseview.startTracking()
                })
                
            };
            
            //specify the source as the CDN then append to this page
            script.src = "https://www.mouseview.org/MouseView.js"
            document.head.appendChild(script)
        }
    }

```

### On Screen Finish

At the end of the screen we want to do several things:
- Stop tracking
- Save data
- Save information about the screen dimensions 
- Hide everything and shut down

The Gorilla hook looks like this, everything in this section is within that hook:
```jsx
gorillaTaskBuilder.onScreenFinish((spreadsheet: any, rowIndex: number, screenIndex: number, row: any, container: string, correct: boolean) => {
   // stuff goes here
})
```
additionally we only want this to run on the MouseView.js displays and screens so we do this: 

```jsx
if (displays.includes(row.display)){ // if we are on one of mouseview displays
    if (screens.includes(screenIndex)){ 
        //stuff goes here
    }
}
```

### Stop tracking mouse/touches and remove overlay

We stop tracking, find the cover we use to hide the trial, then have MouseView.js remove all it's overlay stuff.
```jsx
mouseview.stopTracking() // stop tracking
var cover =$('#cover') // get our cover specified earlier
cover.show() // show it
mouseview.removeAll() // remove mouseview overlay
```

### Calculate things about your trial 
:::caution
Warning! These settings are specific to **your** design. So won't just work on any random Gorilla experiment
:::

We want to calculate the dimensions on the participant's screen, for data analysis purposes. Because everyone's screens are going to be different sizes and ratios, this is vital. 

Below we have two zones containing images called 'Zone1' and 'Zone2' so we get those in addition to the screen size. 
```jsx
// frame provides offset for coordinates of the images themselves 
var gor_frame = {top: parseInt($('.gorilla-frame-responsive')[0].style.top), left: parseInt($('.gorilla-frame-responsive')[0].style.left)}
// get the zones 
var zone1 = $(container).find(`[data-tag='Zone1']`)[0]
var zone2 = $(container).find(`[data-tag='Zone2']`)[0]
// dimensions
var left =  zone1.getBoundingClientRect()
var right = zone2.getBoundingClientRect()
```

We then log out these using the gorill.metric() function from the gorilla API. 

```jsx
gorilla.metric({
        response: left.left + 'x' + left.top + 'x' + left.width + 'x' + left.height,
        zone_name: 'zone1_shape',
        trial_number: trial_num
})
                
gorilla.metric({
        response: right.left + 'x' + right.top + 'x' + right.width + 'x' + right.height,
        zone_name: 'zone2_shape',
        trial_number: trial_num
})
````            
### Save MouseView coordinates! 

Now the most important bit, we save the data for the mousecoordinates overtime. We do this by looping through our data object and logging Gorilla metrics. We also get rid of the cover, ready for the next trial

```jsx
//logout the dimensions of the images 
for (var i = 0; i < mouseview.datalogger.data.length; i++) {
                    gorilla.metric({
                        response: String(mouseview.datalogger.data[i].x) + ' ' + String(mouseview.datalogger.data[i].y),
                        reaction_onset: String(mouseview.datalogger.data[i].time),
                        zone_name: 'coordinate',
                        trial_number: trial_num
                    });
}
cover.hide()
```

### full example script:

Here's a full example:

:::caution
Warning! These settings are specific to **your** design. So won't just work on any random Gorilla experiment.
:::

```jsx title="Full Example Script"

//Settings for mouseview
var aperture_size = "5%" // the size of the viewing apeture
var overlay_colour = 'black' // the colour of the overlay
var overlay_alpha = 0.0 // how transparent the overlay is (0 = clear, 1 = solid)
var overlay_blur = 30 // the SD of the gaussuan blur (higher = blurrier)

//settings for your Gorilla task
var displays = ['trial', 'practice'] // what displays are we using mouseview on
var screens = [2] // in these displays what screens are blurred

gorillaTaskBuilder.onScreenStart((spreadsheet: any, rowIndex: number, screenIndex: number, row: any, container: string) => {
    
    if(rowIndex == 0){
        //create cover screen that we use to hide contents until mouseview is ready
        var cover = document.createElement("div"); 
        cover.style.cssText = "background: #fff; position: fixed; bottom: 0; right: 0; left: 0; top: 0";
        cover.setAttribute('data-html2canvas-ignore','true')
        cover.id = 'cover'
        document.body.append(cover)
        var cover =$('#cover')
        cover.hide()
        
    }
    
    if (displays.includes(row.display)){ // if we are on one of mouseview displays
    
        if (screens.includes(screenIndex)){ // if we are on one of our blurred screens
            
            // hide while we take a screenshot
            var cover =$('#cover')
            cover.show()
            
            // get the webgazer script 
            var script = document.createElement('script');
            
            // onload set the parameters 
            script.onload = function () {
                mouseview.params.overlayColour = overlay_colour //i.e. hex black
                mouseview.params.overlayAlpha = overlay_alpha // how transparent the overlay will be
                mouseview.params.overlayGaussian =overlay_blur // SD in pixels for the gaussian blur filter experimental
                mouseview.params.apetureSize = aperture_size
                mouseview.params.overlayGaussianFunc = () => {
                    var cover =$('#cover')
                    cover.hide()
                }
                $.when(mouseview.init()).then(() => {
                    mouseview.startTracking()
                })
                
            };
            
            script.src = "https://www.mouseview.org/mouseview.js";
            document.head.appendChild(script)
        }
    }
})

// at the end of each trial log coordinates
gorillaTaskBuilder.onScreenFinish((spreadsheet: any, rowIndex: number, screenIndex: number, row: any, container: string, correct: boolean) => {
    if (displays.includes(row.display)){ // if we are on one of mouseview displays
        if (screens.includes(screenIndex)){ // if we are on one of our mouseview screens
                mouseview.stopTracking()
                var cover =$('#cover')
                cover.show()
                mouseview.removeAll()
                
                // calculate dimensions of screen and objects 
                
                // frame provides offset for coordinates of the images themselves 
                var gor_frame = {top: parseInt($('.gorilla-frame-responsive')[0].style.top), left: parseInt($('.gorilla-frame-responsive')[0].style.left)}
                // get the zones 
                var zone1 = $(container).find(`[data-tag='Zone1']`)[0]
                var zone2 = $(container).find(`[data-tag='Zone2']`)[0]
                // dimensions
                var left =  zone1.getBoundingClientRect()
                var right = zone2.getBoundingClientRect()
                
                if (row.display == 'practice'){
                    var trial_num = rowIndex
                } else {
                    var trial_num = rowIndex -1
                }
                
                
                gorilla.metric({
                    response: left.left + 'x' + left.top + 'x' + left.width + 'x' + left.height,
                    zone_name: 'zone1_shape',
                    trial_number: trial_num
                })
                
                gorilla.metric({
                    response: right.left + 'x' + right.top + 'x' + right.width + 'x' + right.height,
                    zone_name: 'zone2_shape',
                    trial_number: trial_num
                })
                
                //logout the dimensions of the images 
                for (var i = 0; i < mouseview.datalogger.data.length; i++) {
                    gorilla.metric({
                        response: String(mouseview.datalogger.data[i].x) + ' ' + String(mouseview.datalogger.data[i].y),
                        reaction_onset: String(mouseview.datalogger.data[i].time),
                        zone_name: 'coordinate',
                        trial_number: trial_num
                    });
                }
                cover.hide()
            }
        }
})
```
