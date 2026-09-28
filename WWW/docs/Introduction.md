---
id: Introduction
title: The Basics
sidebar_label: Quick Start
slug: /
---

## MouseView.js
Attentional mouse tracking. Alternative to online eye tracking.

Demo available [here](https://mouseview.org/demo.html)

<img src="https://github.com/u01ai11/MouseView.js/raw/master/resources/mouseview_demo.gif" width="350"/>


## Getting Started

There are two ways users (that's you) are likely to use this toolbox. 
1) In a custom app, website, or locally. 
2) As part of a prebuilt experiment. 

The easiest way of getting started with the basics is the first one, as an app or web-page hosted locally. We cover this setup here. 

If you are interested in 2) then checkout our [Gorilla](/docs/Gorilla), [jsPsych](/docs/jsPsych) and [PsychoPy/PsychoJS](/docs/PsychoJS-PsychoPy) examples. 

Gorilla is the most straightforward way of buildng a MouseView.js experiment, so we recommend this. You can sign up by visiting [Gorilla.sc](https://www.gorilla.sc/?utm_medium=referral&utm_source=MouseView.js)

### Install and setup
MouseView.js is designed to inject a layer over a webpage. Include the script on your page:

```HTML
<script src="https://mouseview.org/MouseView.js"></script>
```
or download `MouseView.js` (and `MouseView-fallback.js`, see [browser support](#browser-support)) to your site and include it that way
```HTML
<script src="MouseView.js"></script>
```

You can also install it from npm
```
npm install --save mouseviewjs
```

and use it as an ES module. In a script tag, add `type="module"` to the tag.

```jsx
import * as mouseview from "mouseviewjs"; // or "./MouseView.mjs"
mouseview.init()
```

The module method has the benefit of including all your configuration and data code in one script, rather than a loading tag and actions seperately. It also means you do not have to worry about calling mouseview before the page has loaded it. 

Here's an example of how you might use this: 
```HTML
<script type="module">
    import * as mouseview from "./MouseView.mjs";
    mouseview.params.apertureSize = "20%" // set some custom values
    mouseview.params.apertureGauss = 30
    mouseview.init() // now init
</script>
```

## Usage
Once included in one of the methods above, the library adds the mouseview object to the global namespace, you can set various parameters there, and initiate the overlay
```jsx
// set some parameters
mouseview.params.apertureSize = 100
mouseview.params.overlayColour = '#17202A' //i.e. hex black
mouseview.params.overlayAlpha = 0.99

// initiate the overlay 
mouseview.init()
```
For a full overview of settings available see [Configuration.](Configuration.md)

## Browser support

The overlay is drawn with the CSS `backdrop-filter` and `mask-image` properties, so the page underneath stays live (videos, animations and changes to the page are blurred as they happen) and scrolling costs nothing. These are supported by current versions of Chrome, Edge, Firefox and Safari.

If a participant's browser cannot draw the blurred overlay, MouseView.js will **not** silently show them an unblurred page. What happens is up to you, with `mouseview.params.blurUnsupported`:

- `'fail'` (default): a message is shown and `overlayGaussianFunc` is never called, so the task does not start. Use `mouseview.params.onBlurUnsupported` to react, for example to end the study.
- `'fallback'`: MouseView.js loads `MouseView-fallback.js` from next to `MouseView.js` and draws the blur from a screenshot of the page instead. This is slower and does not follow changes to the page between recaptures.
- `'allow'`: carry on without the blur. Only use this if the blur is not part of your stimulus.

You can check a browser before your task starts, for example on a consent page:

```jsx
var support = mouseview.checkSupport()
if (support.renderer === null) {
    // this participant cannot do the task with the current settings
}
```

After `init()`, `mouseview.datalogger.renderer` records how the overlay was drawn (`'css'`, `'css-noblur'` or `'fallback'`), and it is saved with the data.
