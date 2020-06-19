// MouseView.js

/**
* MouseView.js is a library for presenting mouse-tracking view-window tasks and experiments 
* It overlays a configurable occlusion layer with a viewing window that tracks the mouse position
* This allows you to track the temporal and spatial aspects of a web-users attention on a web-page or experiment. 

* The heatmap function is built on simpleheat.js (Copyright (c) 2015, Vladimir Agafonkin) https://github.com/mourner/simpleheat
*/




// We could be in a browser or we could be in Node.js
// We need to import things differently!

// if in node do this
if (typeof module !== 'undefined'){ 
    var window_holder = {} // fake a window
    var simpleheat = require("./dependencies/simpleheat_node.js")
    window_holder.simpleheat = simpleheat // add to our fake window
    console.log('in node')
    // if we are in browser do this
} else {
    // we are in browser so ES6 import simpleheat
    console.log('in browser')
    // nonsense acrobatics appending to the window
    // because ES6 modules can't be imported normally in conditionals
    
    //if we are not being run on the main repo, then get these files from CDN 
    try {
        import('./dependencies/simpleheat_es6.js').then((module) => {
            window.simpleheat = module.default
        })
    }catch(err){
        import('https://mouseview.netlify.app/dependencies/simpleheat_es6.js').then((module) => {
            window.simpleheat = module.default
        })
    }
    
    try {
        import('./dependencies/html2canvas.js').then((module) => {
            console.log(module)
            window.html2canvas = module.default()
        })
    } catch(err) {
        import('https://mouseview.netlify.app/dependencies/html2canvas.js').then((module) => {
            console.log(module)
            window.html2canvas = module.default()
        })
    }  
    
}


(function(window, undefined) {
    'use strict'; // for type safety
    
    // do this for node
    if (typeof module !== 'undefined'){ window = window_holder; }
    
    
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
    mouseview.params.overlayColour = 'none' //i.e. hex black
    mouseview.params.overlayAlpha = 0 // how transparent the overlay will be
    mouseview.params.overlayGaussian = 5 // SD in pixels for the gaussian blur filter experimental (stretches stuff)
    
    // holder for the screenshot canvas
    mouseview.screen_canvas = {}
    // options for canvas
    mouseview.h2canv_opts = {
    }
    
    // holders for overlay width and height 
    mouseview.params.overHeight = 0
    mouseview.params.overWidth = 0
    
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
        overlay.setAttribute('data-html2canvas-ignore','true') //so html2canvas doesn't recapture
        
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
        
        // set event listener for resize and scroll
        window.addEventListener('resize', updateOverlayCanvas);
        window.addEventListener('scroll', updateOverlayCanvas);
        window.addEventListener('orientationchange', updateOverlayCanvas);
        
        //setup options for html2canvs
        mouseview.h2canv_opts = {	
            x: window.scrollX,
            y: window.scrollY,
            width: window.innerWidth,
            height: window.innerHeight,
            logging: true
        }

        // Use html2canvas to get viewport screen shot and store in global holder
        window.html2canvas(document.body, mouseview.h2canv_opts).then((canvas) => {
            // get canvas and draw 
            mouseview.screen_canvas = canvas
            updateFrame()
        })
    }
    
    function removeAll(){
        
        // stop recording
        if (mouseview.datalogger.tracking === true){
            mouseview.stopTracking()
        }
        
        // stop animation
        var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
        cancelAnimationFrame(mouseview.animator_raf)
        
        // remove elements
        var overlay = document.getElementById('overlay');
        overlay.parentNode.removeChild(overlay)

        
        //remove listeners from body and window
        window.removeEventListener('resize', updateOverlayCanvas);
        window.removeEventListener('scroll', updateOverlayCanvas);
        window.removeEventListener('orientationchange', updateOverlayCanvas);
        
        document.removeEventListener('mousemove', event => {
            mouseview.datalogger.x = event.clientX - mouseview.params.offset.X;
            mouseview.datalogger.y = event.clientY - mouseview.params.offset.Y;
        }, false);
        
        // add event listeners for touch-screen
        document.removeEventListener('touchstart', event => {
            mouseview.datalogger.x = event.touches[0].clientX - mouseview.params.offset.X;
            mouseview.datalogger.y = event.touches[0].clientY - mouseview.params.offset.Y;
        }, false);
        
        document.removeEventListener('touchmove', event => {
            mouseview.datalogger.x = event.touches[0].clientX - mouseview.params.offset.X;
            mouseview.datalogger.y = event.touches[0].clientY - mouseview.params.offset.Y;
        }, false);
    }
    
    // function to deal with stuff at the animation frame level
    // this will be called using rAF callback
    function updateFrame(timestamp){

        var overlay = document.getElementById('overlay')

        var ctx = overlay.getContext('2d');
        
        //clear previous frame
        ctx.clearRect(0, 0, mouseview.params.overWidth, mouseview.params.overHeight)
        
        //draw screenshot with gaussian blur if we have set this to be greater than 0
        if(mouseview.params.overlayGaussian > 0){
            ctx.filter = 'blur('+mouseview.params.overlayGaussian+'px)';
            ctx.globalAlpha = 1;
            ctx.drawImage(mouseview.screen_canvas, 0,0, mouseview.params.overWidth, mouseview.params.overHeight)
            
            // only draw aperture if we actually have a mouse position 
            if (mouseview.datalogger.x != null || mouseview.datalogger.y != null){
                ctx.globalCompositeOperation = 'xor';
                // TODO use xor compositing to make non-hard edged corners for aperture
                ctx.beginPath();
                ctx.arc(mouseview.datalogger.x, mouseview.datalogger.y, mouseview.params.apertureSize, 0, 2 * Math.PI, false);
                ctx.fill()

            }
        }
       
        //return to source-over compositing
        ctx.globalCompositeOperation = 'source-over';
        ctx.filter = 'none';
        // draw overlay again, based on global options
        ctx.fillStyle = mouseview.params.overlayColour;
        ctx.globalAlpha = mouseview.params.overlayAlpha;
        ctx.fillRect(0, 0, mouseview.params.overWidth, mouseview.params.overHeight);
        
        
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
        
        //if we are doing a blur then recapture -- but avoid as computationally heavier
        if (mouseview.params.overlayGaussian > 0){
            updateOverlayBlur()
        } else {
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
    }
    
    function updateOverlayBlur(){
        //setup options for html2canvs
        mouseview.h2canv_opts = {	
            x: window.scrollX,
            y: window.scrollY,
            width: window.innerWidth+window.pageXOffset,
             height: window.innerHeight+window.pageYOffset,
            logging: true
        }
        // only update parameters after promise has been done
        window.html2canvas(document.body, mouseview.h2canv_opts).then((canvas) => {
            // get canvas and draw 
            mouseview.screen_canvas = canvas
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
        })
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
    
    function clearData(){
        mouseview.datalogger.data = []
    }
    
    // plot a heatmap of the x and y coordinates
    function plotHeatMap(){
        
        // remove old heatmap if there
        clearHeatmap()
        
        // Append overlay with settings
        mouseview.params.overWidth = document.body.clientWidth
        mouseview.params.overHeight = document.body.clientHeight; // get height and width

        // make a canvas overlay, so we can use rAF to animate and record accurate times
        var overlay = document.createElement('canvas') // create canvas element 
        
        //set settings 
        overlay.id = "heatmap";
        overlay.width = mouseview.params.overWidth
        overlay.height = mouseview.params.overHeight
        overlay.style.zIndex = 999999;
        overlay.style.position = 'fixed';
        overlay.style.display = 'block';
        overlay.style.top = '0px'
        overlay.style.pointerEvents = 'none'
        
        document.body.appendChild(overlay)// show the layer
        
        // get data into expected format for simplheat (list of lists [[x,y,1],....])
        var formattedArray = []
        for (var i = 0; i < mouseview.datalogger.data.length; i++) {
            formattedArray.push([mouseview.datalogger.data[i].x, mouseview.datalogger.data[i].y, 1])
        }
        
        
        //pass canvas and data to simpleheat
        var heat = window.simpleheat(overlay)
        heat.data(formattedArray)
        heat.radius(20,90)
        heat.draw()
    }
    
    function clearHeatmap(){
        var overlay = document.getElementById('heatmap');
        if(overlay !== null) {overlay.parentNode.removeChild(overlay)}
        
    }
    
    // Link specific internal functions to public ones
    mouseview.init = () => {
        init()
    }
    mouseview.removeAll = () => {
        removeAll()
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
    
    mouseview.plotHeatMap = () => {
        plotHeatMap()
    }
    
    mouseview.clearHeatMap = () => {
        clearHeatmap()
    }
    
    mouseview.clearData = () => {
        clearData()
    }
    // Setters 
    
    //some stuff for Node
    //Stuff so we can be a module as well as browser based
    if (typeof module !== 'undefined'){ module.exports = mouseview};


}(window));

