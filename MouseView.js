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
    
    // her we can setup some default settings
    
    // parameters for the aperture 
    mouseview.params.apertureSize = 100 // size of the view window
    mouseview.params.apertureEdge = 'solid' // TODO: provide some options for edge 
    
    // parameters for the overlay
    mouseview.params.overlayColour = '#17202A' //i.e. hex black 
    mouseview.params.overlayAlpha = 0.9 // how transparent the overlay will be
    
    // parameters for tracking 
    mouseview.params.sampleRate = 100 // sample rate in Hz for recording position
    
    
    // Private functions 
    
    function init(){
        /**
        * APPEND OVERLAY AND SETUP TRACKER
        */
    
        // Append overlay with settings
        var docWidth = window.visualViewport.width
        var docHeight = window.visualViewport.height; // get height and width

        // make a canvas overlay, so we can use rAF to animate and record accurate times
        var overlay = document.createElement('canvas') // create canvas element 
        
        //set settings 
        overlay.id = "overlay";
        overlay.width = docWidth
        overlay.height = docHeight
        overlay.style.zIndex = 100;
        overlay.style.position = "absolute";
        
        // Initial context settings (e.g. color )
        var ctx = overlay.getContext("2d");
        ctx.fillStyle = mouseview.params.overlayColour;
        ctx.globalAlpha = mouseview.params.overlayAlpha;
        ctx.fillRect(0, 0, docWidth, docHeight);
        
        //append to body 
        document.body.appendChild(overlay)
    }
    
    // Start tracking the mouse movements
    function startTracking(){
        
    }
    
    // Stop tracking the mouse movements
    function stopTracking(){
        
    }
    
    // function to deal with stuff at the animation frame level
    // this will be called using rAF callback
    function updateFrame(canvas){
        
    }
    
    // update the overlay canvas itself with new settings
    // this is at the canvas not ctx level 
    function updateOverlayCanvas(){
        
        var overlay = document.getElementById("overlay")
        overlay.width = docWidth
        overlay.height = docHeight
        
    }
    

    
    // Public functions
    mouseview.init = () => {
        init()
    }
    // Setters 
    
    
}(window));