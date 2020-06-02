# MouseView.js
 Attentional mouse tracking. Alternative to online eye tracking.

Demo available [here](https://mouseview.netlify.app/demo.html)

# Getting Started

MouseView.js is designed to inject a layer over a webpage. Simply include the script on in your websites head tag.
 
The most up-to-date one is hosted on netlify:
```HTML
<script src="https://mouseview.netlify.app/MouseView.js" type="text/javascript"></script>
```
or you can just download a version to your site and include it that way
```HTML
<script src="MouseView.js" type="text/javascript"></script>
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
