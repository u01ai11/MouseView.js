---
id: Introduction
title: Getting Set up
sidebar_label: Style Guide
slug: /
---

## MouseView.js
Attentional mouse tracking. Alternative to online eye tracking.

This is very much a work in progress, so please **don't use this in production** yet. You have been warned. The known problems are summarised in the issues on this repo.

Demo available [here](https://mouseview-docs.netlify.app/demo.html)

<img src="https://github.com/u01ai11/MouseView.js/raw/master/resources/mouseview_demo.gif" width="350"/>


## Getting Started

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
```JavaScript
// set some parameters
mouseview.params.apertureSize = 100
mouseview.params.overlayColour = '#17202A' //i.e. hex black
mouseview.params.overlayAlpha = 0.99

// initiate the overlay 
mouseview.init()