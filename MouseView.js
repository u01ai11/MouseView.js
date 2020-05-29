// MouseView.js

/**
* MouseView.js is a library for presenting mouse-tracking view-window tasks and experiments 
* It overlays a configurable occlusion layer with a viewing window that tracks the mouse position
* This allows you to track the temporal and spatial aspects of a web-users attention on a web-page or experiment. 
*/

(function(window, undefined) {
    'use strict'; // for type safety
    
    //set up namespace 
    window.mouseview = window.mouseview || {};
    mouseview = mouseview || {}
    
    // set up name spaces for specific purposes 
    mouseview.datalogger = mouseview.datalogger || {} // for logging data 
    mouseview.params = mouseview.params || {} // for parameters 
    mouseview.animator_raf = mouseview.animator_raf || {} // holder for request animationframe
    
    // her we can setup some default settings
    
    // parameters for the aperture 
    mouseview.params.apertureSize = 100// size of the view window
    mouseview.params.apertureEdge = 'solid' // TODO: provide some options for edge 
    
    // parameters for the overlay
    mouseview.params.overlayColour = '#17202A' //i.e. hex black 
    mouseview.params.overlayAlpha = 0.9 // how transparent the overlay will be
    
    // parameters for tracking 
    mouseview.params.sampleRate = 100 // sample rate in Hz for recording position
    
    // holders for overlay width and height 
    mouseview.params.overHeight = mouseview.params.overHeight || window.visualViewport.height
    mouseview.params.overWidth = mouseview.params.overHeight || window.visualViewport.width 
    
    // holders for mouseposition
    mouseview.datalogger.x = null
    mouseview.datalogger.y = null
    
    // Private functions 
    
    function init(){
        /**
        * APPEND OVERLAY AND SETUP TRACKER
        */
    
        // Append overlay with settings
        mouseview.params.overWidth = window.visualViewport.width
        mouseview.params.overHeight = window.visualViewport.height; // get height and width

        // make a canvas overlay, so we can use rAF to animate and record accurate times
        var overlay = document.createElement('canvas') // create canvas element 
        
        //set settings 
        overlay.id = "overlay";
        overlay.width = mouseview.params.overWidth
        overlay.height = mouseview.params.overHeight
        overlay.style.zIndex = 2;
        overlay.style.position = 'absolute';
        
        // Initial context settings (e.g. color )
        var ctx = overlay.getContext("2d");
        ctx.fillStyle = mouseview.params.overlayColour;
        ctx.globalAlpha = mouseview.params.overlayAlpha;
        ctx.fillRect(0, 0, mouseview.params.overWidth, mouseview.params.overHeight);
        
        // set mouse listener to update position on mouse move
        overlay.addEventListener('mousemove', event => {
            mouseview.datalogger.x = event.clientX;
            mouseview.datalogger.y = event.clientY;
        }, false);
        
        //append to body 
        document.body.appendChild(overlay)
        
        //
        updateFrame()
    }
    
    
    
    // function to deal with stuff at the animation frame level
    // this will be called using rAF callback
    function updateFrame(){
        //console.log([mouseview.datalogger.x, mouseview.datalogger.y])
        var ctx = document.getElementById('overlay').getContext('2d');
        
        //clear previous frame
        ctx.clearRect(0, 0, mouseview.params.overWidth, mouseview.params.overHeight)
        
        // this means items drawn atop each other will go to transparent 
        // TODO: make an 'xor' version allowing feathered edges
        
        
        // draw overlay again, based on global options
        ctx.fillStyle = mouseview.params.overlayColour;
        ctx.globalAlpha = mouseview.params.overlayAlpha;
        ctx.fillRect(0, 0, mouseview.params.overWidth, mouseview.params.overHeight);
        
        // now we draw an aperture using canvas compositing
        
        // only draw aperture if we actually have a mouse position 
        if (mouseview.datalogger.x != null || mouseview.datalogger.y != null){
            ctx.globalCompositeOperation = 'xor';
            // TODO use xor compositing to make non-hard edged corners for aperture
            ctx.beginPath();
            ctx.arc(mouseview.datalogger.x, mouseview.datalogger.y, mouseview.params.apertureSize, 0, 2 * Math.PI, false);
            ctx.fill()
            
        }
        
        mouseview.animator_raf = requestAnimationFrame(updateFrame);
    }
    
    // update the overlay canvas itself with new settings
    // this is at the canvas not ctx level 
    function updateOverlayCanvas(){
        
        var overlay = document.getElementById("overlay")
        overlay.width = docWidth
        overlay.height = docHeight
        
    }
    
   // Start tracking the mouse movements
    function startTracking(){
        
    }
    
    // Stop tracking the mouse movements
    function stopTracking(){
        
    }
    
    // Public functions
    mouseview.init = () => {
        init()
    }
    // Setters 
    
    
}(window));