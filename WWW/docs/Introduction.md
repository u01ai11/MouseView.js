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

The easiest way of getting started with the basics is the first one, as an app. We cover this setup here. 

If you are interested in 2) then checkout our Gorilla and jsPsych examples. Gorilla is the most straightforward way of buildng a MouseView.js experiment, so we recommend this. 

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

Once it is included it adds the mouseview object to the global namespace, you can set various parameters there, and initiate the overlay
```jsx
// set some parameters
mouseview.params.apertureSize = 100
mouseview.params.overlayColour = '#17202A' //i.e. hex black
mouseview.params.overlayAlpha = 0.99

// initiate the overlay 
mouseview.init()
