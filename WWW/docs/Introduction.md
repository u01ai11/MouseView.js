---
id: Introduction
title: The Basics
sidebar_label: Quick Start
slug: /
---

## MouseView.js
Attentional mouse tracking. Alternative to online eye tracking.

This is very much a work in progress, so please **don't use this in production** yet. You have been warned. The known problems are summarised in the issues on this repo.

Demo available [here](https://mouseview-docs.netlify.app/demo.html)

<img src="https://github.com/u01ai11/MouseView.js/raw/master/resources/mouseview_demo.gif" width="350"/>


## Getting Started

There are two ways users (that's you) are likely to use this toolbox. 
1) In a custom app, website, or locally. 
2) As part of a prebuilt experiment. 

The easiest way of getting started with the basics is the first one, as an app or web-page hosted locally. We cover this setup here. 

If you are interested in 2) then checkout our [Gorilla](/docs/Gorilla), [jsPsych](/docs/jsPsych) and [PsychoPy/PsychoJS](/docs/PsychoJS-PsychoPy) examples. 

Gorilla is the most straightforward way of buildng a MouseView.js experiment, so we recommend this. You can sign up by visiting [Gorilla.sc](https://www.gorilla.sc/?utm_medium=referral&utm_source=MouseView.js)

### Install and setup
MouseView.js is designed to inject a layer over a webpage. Simply include the script on in your websites **body** tag.
 
The most up-to-date one is hosted on netlify:
```HTML
<script src="https://mouseview-docs.netlify.app/MouseView.js" type="module"></script>
```
or you can just download a version to your site and include it that way
```HTML
<script src="MouseView.js" type="module"></script>
```

or you can use it as an ES6 import in JavaScript. If this is in a script tag, make sure to add type="module" in the tag.

```jsx
import * as mouseview from "/MouseView.js";
mouseview.init()
```

The above method has the benefit of including all your configuration and data code in one script. Rather than a loading tag and actions seperately. It also means you do not have to worry about calling mouseview before the page has loaded it. 

Here's an example of how you might use this: 
```HTML
<script type="module">
    import * as mouseview from "/MouseView.js";
    mouseview.params.apertureSize = "20%" // set some custom values
    mouseview.params.apertureGauss = 30
    mouseview.init() // now init
</script>
```

## Usage
Once included in one of the mthods above, the library adds the mouseview object to the global namespace, you can set various parameters there, and initiate the overlay
```jsx
// set some parameters
mouseview.params.apertureSize = 100
mouseview.params.overlayColour = '#17202A' //i.e. hex black
mouseview.params.overlayAlpha = 0.99

// initiate the overlay 
mouseview.init()
```
For a full overview of settings available see [Configuration.](Configuration.md)
