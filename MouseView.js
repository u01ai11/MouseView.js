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
    mouseview.timing = mouseview.timing || {}
    // her we can setup some default settings
    
    // parameters for the aperture 
    mouseview.params.apertureSize = 100// size of the view window
    mouseview.params.apertureEdge = 'solid' // TODO: provide some options for edge 
    
    // parameters for the overlay
    mouseview.params.overlayColour = '#17202A' //i.e. hex black
    mouseview.params.overlayAlpha = 0.99 // how transparent the overlay will be
    mouseview.params.overlayGaussian = 0 // SD in pixels for the gaussian blur filter NOT WORKING, will blur everything under div
    
    
    // holders for overlay width and height 
    mouseview.params.overHeight = mouseview.params.overHeight || window.visualViewport.height
    mouseview.params.overWidth = mouseview.params.overHeight || window.visualViewport.width 
    
    //holders for mouse offset due to scrolling
    mouseview.params.offset = {}
    mouseview.params.offset.X = 0
    mouseview.params.offset.Y = 0
    
    // holders for current mouseposition
    mouseview.datalogger.X = null
    mouseview.datalogger.Y = null
    
    // holders for recording state
    mouseview.datalogger.tracking = false
    
    // Array to contain objects
    mouseview.datalogger.data = []
    
    // parameters for timing
    mouseview.timing.sampleRate = 16.66 // wanted frame time, set as 0 to acheive best, but inconsistent timing
    mouseview.timing.lastTime = 0.0 // holder for last frame time
    mouseview.timing.startTime = 0.0 // holder for start time 
    mouseview.timing.finishTime = 0.0 // holder for finish time
    // Private functions 
    
    function init(){
        /**
        * APPEND OVERLAY AND SETUP TRACKER
        */
    
        // Append overlay with settings
        mouseview.params.overWidth = document.body.clientWidth
        mouseview.params.overHeight = document.body.clientHeight; // get height and width

        // make a canvas overlay, so we can use rAF to animate and record accurate times
        var overlay = document.createElement('canvas') // create canvas element 
        
        //set settings 
        overlay.id = "overlay";
        overlay.width = mouseview.params.overWidth
        overlay.height = mouseview.params.overHeight
        overlay.style.zIndex = 99999;
        overlay.style.position = 'fixed';
        overlay.style.display = 'block';
        overlay.style.top = '0px'
        overlay.style.pointerEvents = 'none'
        
        
        // set mouse listener to update position on mouse move
        document.body.addEventListener('mousemove', event => {
            mouseview.datalogger.x = event.clientX - mouseview.params.offset.X;
            mouseview.datalogger.y = event.clientY - mouseview.params.offset.Y;
        }, false);
        
        // add event listeners for touch-screen
        document.body.addEventListener('touchstart', event => {
            mouseview.datalogger.x = event.touches[0].clientX - mouseview.params.offset.X;
            mouseview.datalogger.y = event.touches[0].clientY - mouseview.params.offset.Y;
        }, false);
        
        document.body.addEventListener('touchmove', event => {
            mouseview.datalogger.x = event.touches[0].clientX - mouseview.params.offset.X;
            mouseview.datalogger.y = event.touches[0].clientY - mouseview.params.offset.Y;
        }, false);
        
        //append to body 
        document.body.appendChild(overlay)
        
        // make SVG layers for gaussian filter
        var svg_layer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg_layer.setAttribute('height',0)
        var filter_main = document.createElementNS("http://www.w3.org/2000/svg","filter"); // make main filter a container
        filter_main.setAttribute('id', 'blur_filter') //set id of filter container
        var fe_gaus =  document.createElementNS("http://www.w3.org/2000/svg","feGaussianBlur"); // gaussian blur overlay within the filter
        fe_gaus.setAttribute('stdDeviation',mouseview.params.overlayGaussian) // set SD of gausian blur 
        filter_main.appendChild(fe_gaus) // append to filter main

        //append remaining bits to svg code   
        svg_layer.appendChild(filter_main) // append the filter to svg code
        document.body.appendChild(svg_layer) // append to body
        
        //now we create a floating div and set it to use the filter
        var div = document.createElement("div");
        div.style.width = "100%";
        div.style.height = "100%";
        div.style.position = "fixed"
        
        // TO DO: backdrop filter is a new thing, compatibility may be an issue
        div.setAttribute('style', div.getAttribute('style') +'backdrop-filter: url(#blur_filter)')
        
        //use backdrop filter to cover
        document.body.append(div)
        // set event listener for resize and scroll
        window.addEventListener('resize', updateOverlayCanvas);
        window.addEventListener('scroll', updateOverlayCanvas);
        window.addEventListener('orientationchange', updateOverlayCanvas);
        
        updateFrame()
    }
    
    
    
    // function to deal with stuff at the animation frame level
    // this will be called using rAF callback
    function updateFrame(timestamp){
        //console.log([mouseview.datalogger.x, mouseview.datalogger.y])
        var overlay = document.getElementById('overlay')
        //overlay.style.setProperty('backdrop-filter',"blur(" + mouseview.params.overlayGaussian + "px)") //blurs everything
        var ctx = overlay.getContext('2d');
        
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
        
        // if logging log mouse position
        if (mouseview.datalogger.tracking === true){
            // if we have reached desired sampling interval
            console.log(timestamp, mouseview.timing.lastTime, mouseview.timing.sampleRate)
            
            if ( (timestamp - mouseview.timing.lastTime) >= mouseview.timing.sampleRate) {
                logPosition(mouseview.datalogger.x, mouseview.datalogger.y, timestamp) //log position
                mouseview.timing.lastTime = timestamp // update last timestamp
            }
        }
        
        // next frame
        mouseview.animator_raf = requestAnimationFrame(updateFrame);

    }
    
    // update the overlay canvas itself with new settings
    // this is at the canvas not ctx level 
    function updateOverlayCanvas(){
        
        var overlay = document.getElementById("overlay")
        mouseview.params.overWidth = overlay.parentNode.getBoundingClientRect().width
        mouseview.params.overHeight = overlay.parentNode.getBoundingClientRect().height // get height and width

        // set overlay
        overlay.width = mouseview.params.overWidth
        overlay.height = mouseview.params.overHeight
        
        // recalculate offset
        var BB=overlay.getBoundingClientRect();
        mouseview.params.offset.X = BB.left
        mouseview.params.offset.Y = BB.top
    }
    
   // Start tracking the mouse movements
    function startTracking(){
        mouseview.datalogger.tracking = true
        mouseview.timing.startTime = window.performance.now()
        console.log('Started recording data')
    }
    
    // Stop tracking the mouse movements
    function stopTracking(){
        mouseview.datalogger.tracking = false
        mouseview.timing.finishTimeTime = window.performance.now()
        console.log('Stopped recording data')
        console.log(mouseview.datalogger.data)
    }
    
    // logging data
    function logPosition(xpos, ypos, timestamp){
        mouseview.datalogger.data.push({
            x: xpos,
            y: ypos,
            time: timestamp - mouseview.timing.startTime
        })
    }
    
    //storing data locally (helpful for multiple pages)
    function storeData(){
        mouseview.datalogger.data.unshift(window.location.pathname) // add pathname to beginning of data
        localStorage.setItem("mouseview_data", JSON.stringify(mouseview.datalogger.data));
    }
    
    //getting local data (helpful for plotting data)
    
    function getData(){
        mouseview.datalogger.data = JSON.parse(localStorage.getItem("mouseview_data") || []);
        mouseview.datalogger.data.push(window.location.pathname) // add pathname to end of data
    }
    
    // Public functions
    mouseview.init = () => {
        init()
    }
    
    mouseview.startTracking = () => {
        startTracking()
    }
    
    mouseview.stopTracking = () => {
        stopTracking()
    }
    
    mouseview.storeData = () => {
        storeData()
    }
    
    mouseview.getData = () => {
        getData()
    }
    // Setters 
    
    
}(window));