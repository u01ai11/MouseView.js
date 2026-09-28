// MouseView.js

/**
* MouseView.js is a library for presenting mouse-tracking view-window tasks and experiments
* It overlays a configurable occlusion layer with a viewing window that tracks the mouse position
* This allows you to track the temporal and spatial aspects of a web-users attention on a web-page or experiment.

* The heatmap function is built on simpleheat.js (Copyright (c) 2015, Vladimir Agafonkin) https://github.com/mourner/simpleheat
*/



(function(window, undefined) {
    'use strict'; // for type safety

    //set up namespace
    window.mouseview = window.mouseview || {};
    var mouseview = window.mouseview;

    mouseview.version = '0.4.0'

    // set up name spaces for specific purposes
    mouseview.datalogger = mouseview.datalogger || {} // for logging data
    mouseview.params = mouseview.params || {} // for parameters
    mouseview.animator_raf = mouseview.animator_raf || {} // holder for request animationframe
    mouseview.timing = mouseview.timing || {}
    mouseview.renderers = mouseview.renderers || {} // renderer factories, the fallback registers itself here
    // her we can setup some default settings

    // parameters for the aperture this can be an int, it will be interpreted as a pixel, or percentage and it will be a percentage of the screen size
    mouseview.params.apertureSize = '5%'// size of the view window
    mouseview.params.apertureGauss = 10 // if we are using a gaussian edge, this sets the blurring 0 for no blurr
    // 'classic' reproduces the look of MouseView.js <= 0.1.x exactly (the overlay is not fully removed inside the aperture)
    // 'clear' gives a single, fully clear aperture
    mouseview.params.apertureMode = 'classic'
    // how the aperture follows the participant
    // 'move': the aperture follows the mouse/finger
    // 'click': the aperture only jumps to the last click/tap, which is logged as a 'click' event
    mouseview.params.updateMode = 'move'

    // parameters for the overlay
    mouseview.params.overlayColour = 'black' //i.e. hex black
    mouseview.params.overlayAlpha = 0.8 // how transparent the overlay will be
    mouseview.params.overlayGaussian = 20 // SD in pixels for the gaussian blur filter
    mouseview.params.overlayGaussianFunc = () => {console.log('overlay generated')} //function that can be set, which will run on completion of blurred overlay being generated
    mouseview.params.overlayGaussianInterval = 0 // only used by the fallback renderer: ms between recaptures of the page (0 = only on resize)

    // what to do when this browser cannot render the blurred overlay natively
    // 'fail': show blurUnsupportedMessage and never call overlayGaussianFunc
    // 'fallback': load MouseView-fallback.js, which renders the blur from a screenshot of the page
    // 'allow': carry on without the blur (never use this if the blur is part of your stimulus)
    mouseview.params.blurUnsupported = 'fail'
    mouseview.params.blurUnsupportedMessage = 'Sorry, your browser cannot display this task. Please try again using an up-to-date version of Chrome, Edge, Firefox or Safari.'
    mouseview.params.onBlurUnsupported = null // function(info), called when blurUnsupported is 'fail' and the blur cannot be shown
    mouseview.params.fallbackUrl = null // where to load MouseView-fallback.js from, defaults to next to MouseView.js
    mouseview.params.forceRenderer = null // 'css' or 'fallback', for testing only

    // parameters for using device orientation to control aperture
    mouseview.params.mobileTilt = false // allow the aperture to be controlled by device orientation
    mouseview.params.mobileTiltWarn = false // warn if not compatible
    mouseview.params.mobileTiltWarnMessage = 'Sorry, tilt not supported on your device'

    // holders for overlay width and height
    mouseview.params.overHeight = window.innerHeight
    mouseview.params.overWidth = window.innerWidth

    //holders for mouse offset due to scrolling
    mouseview.params.offset = {}
    mouseview.params.offset.X = 0
    mouseview.params.offset.Y = 0

    // holders for current mouseposition (viewport coordinates)
    mouseview.datalogger.x = null
    mouseview.datalogger.y = null

    // holders for recording state
    mouseview.datalogger.tracking = false
    mouseview.datalogger.paused = false // true while the aperture position is frozen by pauseUpdating

    // which renderer drew the overlay ('css', 'css-noblur' or 'fallback'), and how the aperture was drawn
    mouseview.datalogger.renderer = null
    mouseview.datalogger.apertureMode = null
    mouseview.datalogger.path = null

    // Array to contain objects
    mouseview.datalogger.data = []

    // parameters for timing
    mouseview.timing.sampleRate = 16.66 // wanted frame time, set as 0 to acheive best, but inconsistent timing
    mouseview.timing.lastTime = 0.0 // holder for last frame time
    mouseview.timing.startTime = 0.0 // holder for start time
    mouseview.timing.finishTime = 0.0 // holder for finish time
    mouseview.timing.lastOverlayRefresh = 0.0 // holder for last overlay screen refresh

    // resolved when the script is parsed, document.currentScript is null later on
    var scriptSrc = (document.currentScript && document.currentScript.src) || null

    var OVERLAY_Z = 99999
    var renderer = null // the active renderer
    var handlers = {} // bound listeners, so removeAll can remove them
    var initToken = 0 // bumped by removeAll, so late async work from an old init does nothing
    var positionRaf = null
    var hidden = false // set by hide/show, applied to the overlay layers

    // Private functions

    /**
    * APERTURE PROFILE
    * The original canvas overlay cut the aperture with gaussian-blurred discs, composited with 'xor'.
    * These functions give the exact result of that compositing at a distance r from the aperture centre,
    * as weights of the overlay colour (wC) and the blurred page (wB). The sharp page shows through with 1 - wC - wB.
    */

    // exponentially scaled modified bessel function I0(x) * exp(-x), abramowitz and stegun 9.8.1/9.8.2
    function besselI0e(x){
        if (x < 3.75){
            var t = (x/3.75)*(x/3.75)
            return Math.exp(-x)*(1+t*(3.5156229+t*(3.0899424+t*(1.2067492+t*(0.2659732+t*(0.0360768+t*0.0045813))))))
        }
        var u = 3.75/x
        return (1/Math.sqrt(x))*(0.39894228+u*(0.01328592+u*(0.00225319+u*(-0.00157565+u*(0.00916281+u*(-0.02057706+u*(0.02635537+u*(-0.01647633+u*0.00392377))))))))
    }

    // the value at distance r of a disc of radius R blurred by a gaussian with SD sigma
    // (the chance that a 2D gaussian centred at r lands inside the disc)
    function discCoverage(r, R, sigma){
        if (R <= 0) { return 0 }
        if (!(sigma > 0.25)) { return r < R ? 1 : (r === R ? 0.5 : 0) }
        var lo = Math.max(0, r - 7*sigma)
        var hi = Math.min(R, r + 7*sigma)
        if (hi <= lo) { return r < R ? 1 : 0 }
        var n = 120, step = (hi - lo)/n, s2 = sigma*sigma, sum = 0
        for (var k = 0; k < n; k++){
            var rho = lo + (k + 0.5)*step
            sum += (rho/s2)*Math.exp(-((rho - r)*(rho - r))/(2*s2))*besselI0e(rho*r/s2)
        }
        return Math.min(1, sum*step)
    }

    // radii of the two apertures the original drew: R1 cut the blurred layer, R2 cut the overlay colour
    function apertureRadii(params, width, height){
        var size = params.apertureSize
        if (typeof(size) == "string"){
            var pct = parseInt(size)/100
            return { R1: Math.min(width, height)*pct/2, R2: height*pct }
        }
        return { R1: size/2, R2: size }
    }

    // weights of the overlay colour and the blurred page at distance r
    function apertureWeights(r, opts){
        var a = opts.alpha, sigma = opts.sigma
        var h1 = discCoverage(r, opts.R1, sigma)
        if (opts.mode === 'clear'){
            return { wC: a*(1 - h1), wB: opts.blur ? (1 - a)*(1 - h1) : 0 }
        }
        if (!opts.blur){ h1 = 1 } // without blur the original only cut the second hole
        var s = a*discCoverage(r, opts.R2, sigma) // second hole was drawn at globalAlpha = overlayAlpha
        var A = a + (1 - a)*(1 - h1) // alpha after drawing the overlay colour over the holed, blurred page
        return {
            wC: a*(1 - s) + s*(1 - A),
            wB: opts.blur ? (1 - a)*(1 - h1)*(1 - s) : 0
        }
    }

    function profileOptions(params, width, height){
        var radii = apertureRadii(params, width, height)
        return {
            mode: params.apertureMode === 'clear' ? 'clear' : 'classic',
            alpha: Math.min(1, Math.max(0, Number(params.overlayAlpha) || 0)),
            sigma: Math.max(0, Number(params.apertureGauss) || 0),
            blur: Number(params.overlayGaussian) > 0,
            R1: radii.R1,
            R2: radii.R2
        }
    }

    // sample radii, dense where the profile changes and sparse where it is flat
    function profileRadii(opts){
        var edges
        if (opts.mode === 'clear') { edges = [opts.R1] }
        else if (opts.blur) { edges = [opts.R1, opts.R2] }
        else { edges = [opts.R2] }
        var rs = [0], sigma = opts.sigma, rMax = 0
        edges.forEach(function(R){
            if (sigma > 0.25){
                for (var t = -5; t <= 5; t += 0.25) { rs.push(R + t*sigma) }
                rMax = Math.max(rMax, R + 5*sigma)
            } else {
                rs.push(R - 0.01, R + 0.01)
                rMax = Math.max(rMax, R + 0.01)
            }
        })
        rs.push(rMax)
        rs = rs.filter(function(r){ return r >= 0 }).sort(function(a, b){ return a - b })
        return rs.filter(function(r, i){ return i === 0 || r - rs[i-1] > 0.005 })
    }

    // the aperture as a list of {r, wC, wB}, used to build the masks (and by the parity test)
    function buildProfile(params, width, height){
        var opts = profileOptions(params, width, height)
        return profileRadii(opts).map(function(r){
            var w = apertureWeights(r, opts)
            return { r: r, wC: w.wC, wB: w.wB }
        })
    }

    /**
    * BROWSER SUPPORT
    */
    function cssSupports(prop, value){
        try { return !!(window.CSS && CSS.supports && CSS.supports(prop, value)) } catch (e) { return false }
    }

    function checkSupport(){
        var backdropFilter = cssSupports('backdrop-filter', 'blur(1px)') || cssSupports('-webkit-backdrop-filter', 'blur(1px)')
        var mask = cssSupports('mask-image', 'radial-gradient(black, transparent)') || cssSupports('-webkit-mask-image', 'radial-gradient(black, transparent)')
        var canvasFilter = typeof CanvasRenderingContext2D !== 'undefined' && 'filter' in CanvasRenderingContext2D.prototype
        var needBlur = Number(mouseview.params.overlayGaussian) > 0
        var chosen = null
        if (mask && (backdropFilter || !needBlur)) { chosen = 'css' }
        else if (mouseview.params.blurUnsupported === 'fallback') { chosen = 'fallback' }
        else if (mouseview.params.blurUnsupported === 'allow') { chosen = mask ? 'css-noblur' : 'fallback' }
        return { backdropFilter: backdropFilter, mask: mask, canvasFilter: canvasFilter, renderer: chosen }
    }

    /**
    * CSS RENDERER
    * Two fixed layers: a backdrop-filter blur, and the overlay colour on top.
    * Each is masked by a radial gradient centred on the mouse, so no canvas is redrawn and page content stays live underneath.
    */
    function createCssRenderer(){
        var blurLayer, colourLayer

        function layer(id){
            var el = document.createElement('div')
            el.id = id
            el.setAttribute('data-html2canvas-ignore', 'true')
            var s = el.style
            s.position = 'fixed'
            s.top = s.left = s.right = s.bottom = '0px'
            s.zIndex = OVERLAY_Z
            s.pointerEvents = 'none'
            return el
        }

        function setMask(el, value){
            el.style.webkitMaskImage = value
            el.style.maskImage = value
        }

        function stops(profile, key){
            return profile.map(function(p){
                var m = key(p)
                return 'rgba(0,0,0,' + Math.min(1, Math.max(0, m)).toFixed(4) + ') ' + p.r.toFixed(2) + 'px'
            }).join(', ')
        }

        function uniform(m){
            return 'linear-gradient(rgba(0,0,0,' + m + '), rgba(0,0,0,' + m + '))'
        }

        function apply(){
            var params = mouseview.params
            var alpha = Math.min(1, Math.max(0, Number(params.overlayAlpha) || 0))
            var blurPx = Number(params.overlayGaussian) || 0

            var blurValue = blurPx > 0 ? 'blur(' + blurPx + 'px)' : 'none'
            blurLayer.style.webkitBackdropFilter = blurValue
            blurLayer.style.backdropFilter = blurValue
            blurLayer.style.display = blurPx > 0 ? 'block' : 'none'
            colourLayer.style.backgroundColor = params.overlayColour

            if (mouseview.datalogger.x == null){
                // no aperture until we know where the mouse is
                setMask(blurLayer, uniform(1))
                setMask(colourLayer, uniform(alpha))
                return
            }
            var profile = buildProfile(params, window.innerWidth, window.innerHeight)
            var centre = 'radial-gradient(circle at var(--mv-x) var(--mv-y), '
            setMask(colourLayer, centre + stops(profile, function(p){ return p.wC }) + ')')
            setMask(blurLayer, centre + stops(profile, function(p){ return p.wC < 1 ? p.wB/(1 - p.wC) : 1 }) + ')')
        }

        return {
            name: 'css',
            mount: function(ready){
                blurLayer = layer('overlay-blur')
                colourLayer = layer('overlay')
                document.body.appendChild(blurLayer)
                document.body.appendChild(colourLayer)
                apply()
                setTimeout(ready, 0)
            },
            update: apply,
            setPosition: function(x, y, first){
                blurLayer.style.setProperty('--mv-x', x + 'px')
                blurLayer.style.setProperty('--mv-y', y + 'px')
                colourLayer.style.setProperty('--mv-x', x + 'px')
                colourLayer.style.setProperty('--mv-y', y + 'px')
                if (first) { apply() }
            },
            scroll: function(){},
            unmount: function(){
                [blurLayer, colourLayer].forEach(function(el){
                    if (el && el.parentNode) { el.parentNode.removeChild(el) }
                })
            }
        }
    }

    /**
    * FALLBACK RENDERER LOADING
    */
    function fallbackSrc(){
        if (mouseview.params.fallbackUrl) { return mouseview.params.fallbackUrl }
        var src = scriptSrc
        if (!src){
            var scripts = document.getElementsByTagName('script')
            for (var i = 0; i < scripts.length; i++){
                if (/MouseView(\.min)?\.js(\?|#|$)/i.test(scripts[i].src)) { src = scripts[i].src }
            }
        }
        return src ? src.replace(/[^\/]*$/, '') + 'MouseView-fallback.js' : 'MouseView-fallback.js'
    }

    function loadFallback(done){
        if (mouseview.renderers.fallback) { return done(null) }
        var el = document.createElement('script')
        el.src = fallbackSrc()
        el.onload = function(){ done(mouseview.renderers.fallback ? null : new Error('MouseView-fallback.js did not register a renderer')) }
        el.onerror = function(){ done(new Error('Could not load ' + el.src)) }
        document.head.appendChild(el)
    }

    /**
    * FAILURE MESSAGE
    */
    function showUnsupported(info){
        removeMessage()
        var msg = document.createElement('div')
        msg.id = 'mouseview-message'
        msg.setAttribute('role', 'alert')
        var s = msg.style
        s.position = 'fixed'
        s.top = s.left = s.right = s.bottom = '0px'
        s.zIndex = 2147483647
        s.background = '#ffffff'
        s.color = '#222222'
        s.display = 'flex'
        s.alignItems = 'center'
        s.justifyContent = 'center'
        s.padding = '24px'
        s.textAlign = 'center'
        s.font = '18px/1.5 system-ui, -apple-system, sans-serif'
        msg.textContent = mouseview.params.blurUnsupportedMessage
        document.body.appendChild(msg)
        console.error('MouseView.js: the overlay cannot be displayed in this browser', info)
        if (typeof mouseview.params.onBlurUnsupported === 'function'){
            mouseview.params.onBlurUnsupported(info)
        }
    }

    function removeMessage(){
        var msg = document.getElementById('mouseview-message')
        if (msg) { msg.parentNode.removeChild(msg) }
    }

    /**
    * APPEND OVERLAY AND SETUP TRACKER
    */
    function init(){
        if (!document.body){
            document.addEventListener('DOMContentLoaded', init, { once: true })
            return
        }
        if (renderer || document.getElementById('overlay')) { removeAll() }
        var token = ++initToken
        mouseview.datalogger.paused = false
        hidden = false
        mouseview.datalogger.renderer = null
        mouseview.datalogger.apertureMode = null

        mouseview.params.overHeight = window.innerHeight
        mouseview.params.overWidth = window.innerWidth
        mouseview.params.offset.X = window.pageXOffset
        mouseview.params.offset.Y = window.pageYOffset

        var support = checkSupport()
        var chosen = mouseview.params.forceRenderer || support.renderer
        if (!chosen){
            support.reason = 'unsupported'
            showUnsupported(support)
            return
        }

        var start = function(){
            if (token !== initToken) { return }
            renderer = chosen === 'fallback' ? mouseview.renderers.fallback(mouseview) : createCssRenderer()
            mouseview.datalogger.renderer = chosen === 'fallback' ? 'fallback' : chosen
            mouseview.datalogger.apertureMode = mouseview.params.apertureMode === 'clear' ? 'clear' : 'classic'
            if (chosen === 'css-noblur'){
                console.warn('MouseView.js: this browser cannot blur the overlay, continuing without blur because blurUnsupported is "allow"')
            }
            addListeners()
            renderer.mount(function(err){
                if (token !== initToken) { return }
                if (err){
                    removeAll()
                    support.reason = 'fallback-failed'
                    support.error = err
                    showUnsupported(support)
                    return
                }
                mouseview.params.overlayGaussianFunc()
            })
            applyVisibility()
        }

        if (chosen === 'fallback'){
            loadFallback(function(err){
                if (token !== initToken) { return }
                if (err){
                    support.reason = 'fallback-failed'
                    support.error = err
                    showUnsupported(support)
                    return
                }
                start()
            })
        } else {
            start()
        }
    }

    function setPosition(x, y){
        var first = mouseview.datalogger.x == null
        mouseview.datalogger.x = x
        mouseview.datalogger.y = y
        if (first){
            if (renderer) { renderer.setPosition(x, y, true) }
            return
        }
        if (positionRaf === null){
            positionRaf = requestAnimationFrame(function(){
                positionRaf = null
                if (renderer) { renderer.setPosition(mouseview.datalogger.x, mouseview.datalogger.y, false) }
            })
        }
    }

    function addListeners(){
        handlers.scroll = function(){
            mouseview.params.offset.X = window.pageXOffset
            mouseview.params.offset.Y = window.pageYOffset
            if (renderer) { renderer.scroll() }
        }
        handlers.resize = function(){ updateOverlayCanvas() }

        window.addEventListener('scroll', handlers.scroll)
        window.addEventListener('resize', handlers.resize)
        window.addEventListener('orientationchange', handlers.resize)

        if(mouseview.params.mobileTilt === true && mouseview.params.mobileTiltWarn === true){
            if (!window.DeviceOrientationEvent){
                alert(mouseview.params.mobileTiltWarnMessage)
            }
        }

        addPositionListeners()
    }

    // the listeners that move the aperture, kept separate so pauseUpdating can remove just these
    function addPositionListeners(){
        if (mouseview.params.updateMode === 'click'){
            handlers.press = function(event){
                var point = event.touches ? event.touches[0] : event
                if (!point) { return }
                setPosition(point.clientX, point.clientY)
                if (mouseview.datalogger.tracking === true) { logEvent('click') }
            }
            // pointerdown covers mouse and touch in one event, so a tap isn't logged twice
            handlers.pressTypes = window.PointerEvent ? ['pointerdown'] : ['mousedown', 'touchstart']
            handlers.pressTypes.forEach(function(type){ document.addEventListener(type, handlers.press, false) })
        } else {
            if (mouseview.params.updateMode !== 'move'){
                console.warn("MouseView.js: unknown updateMode '" + mouseview.params.updateMode + "', using 'move'")
            }
            handlers.mousemove = function(event){ setPosition(event.clientX, event.clientY) }
            handlers.touch = function(event){
                if (event.touches && event.touches.length) { setPosition(event.touches[0].clientX, event.touches[0].clientY) }
            }
            document.addEventListener('mousemove', handlers.mousemove, false)
            document.addEventListener('touchstart', handlers.touch, false)
            document.addEventListener('touchmove', handlers.touch, false)
        }

        //set up mobile orientation listeners
        if(mouseview.params.mobileTilt === true){
            handlers.orientation = orientationHandler
            window.addEventListener('deviceorientation', handlers.orientation)
        }
    }

    function removePositionListeners(){
        if (handlers.press){
            handlers.pressTypes.forEach(function(type){ document.removeEventListener(type, handlers.press, false) })
        }
        if (handlers.mousemove) { document.removeEventListener('mousemove', handlers.mousemove, false) }
        if (handlers.touch){
            document.removeEventListener('touchstart', handlers.touch, false)
            document.removeEventListener('touchmove', handlers.touch, false)
        }
        if (handlers.orientation) { window.removeEventListener('deviceorientation', handlers.orientation) }
        delete handlers.press
        delete handlers.pressTypes
        delete handlers.mousemove
        delete handlers.touch
        delete handlers.orientation
    }

    function removeListeners(){
        removePositionListeners()
        if (handlers.scroll) { window.removeEventListener('scroll', handlers.scroll) }
        if (handlers.resize){
            window.removeEventListener('resize', handlers.resize)
            window.removeEventListener('orientationchange', handlers.resize)
        }
        handlers = {}
    }

    // freeze the aperture where it is, the overlay stays up
    function pauseUpdating(){
        if (mouseview.datalogger.paused === true) { return }
        mouseview.datalogger.paused = true
        removePositionListeners()
        if (mouseview.datalogger.tracking === true) { logEvent('updating_paused') }
    }

    function resumeUpdating(){
        if (mouseview.datalogger.paused !== true) { return }
        mouseview.datalogger.paused = false
        if (renderer) { addPositionListeners() }
        if (mouseview.datalogger.tracking === true) { logEvent('updating_resumed') }
    }

    // hide/show change opacity rather than removing the overlay, so it is ready to show again on the next frame
    function applyVisibility(){
        ['overlay', 'overlay-blur'].forEach(function(id){
            var el = document.getElementById(id)
            if (el) { el.style.opacity = hidden ? '0' : '' }
        })
    }

    function hide(){
        hidden = true
        applyVisibility()
        if (mouseview.datalogger.tracking === true) { logEvent('overlay_hidden') }
    }

    function show(){
        hidden = false
        applyVisibility()
        if (mouseview.datalogger.tracking === true) { logEvent('overlay_shown') }
    }

    function removeAll(){
        initToken++

        // stop recording
        if (mouseview.datalogger.tracking === true){
            stopTracking()
        }

        if (positionRaf !== null) { cancelAnimationFrame(positionRaf); positionRaf = null }
        removeListeners()

        if (renderer) { renderer.unmount(); renderer = null }
        ['overlay', 'overlay-blur'].forEach(function(id){
            var el = document.getElementById(id)
            if (el) { el.parentNode.removeChild(el) }
        })
        removeMessage()

        mouseview.datalogger.x = null
        mouseview.datalogger.y = null
        mouseview.datalogger.paused = false
        hidden = false
    }

    // re-apply the parameters and window size to the overlay
    function updateOverlayCanvas(){
        mouseview.params.overWidth = window.innerWidth
        mouseview.params.overHeight = window.innerHeight
        mouseview.params.offset.X = window.pageXOffset
        mouseview.params.offset.Y = window.pageYOffset
        if (renderer) { renderer.update() }
    }

    function sampleLoop(timestamp){
        if (mouseview.datalogger.tracking !== true) { return }
        // allow for frame jitter, otherwise a 16.66ms target on a 60Hz screen skips frames that arrive after 16.6ms
        var tolerance = Math.min(4, mouseview.timing.sampleRate / 4)
        if ((timestamp - mouseview.timing.lastTime) >= mouseview.timing.sampleRate - tolerance) {
            var pos = pagePosition()
            logPosition(pos.x, pos.y, timestamp)
            mouseview.timing.lastTime = timestamp // update last timestamp
        }
        mouseview.animator_raf = requestAnimationFrame(sampleLoop)
    }

   // Start tracking the mouse movements
    function startTracking(){
        if (mouseview.datalogger.tracking === true) { return }
        mouseview.datalogger.tracking = true
        mouseview.timing.startTime = window.performance.now()
        mouseview.timing.lastTime = mouseview.timing.startTime
        // log where the aperture is when tracking starts, so every recording has a sample at time 0
        var pos = pagePosition()
        logPosition(pos.x, pos.y, mouseview.timing.startTime)
        mouseview.animator_raf = requestAnimationFrame(sampleLoop)
    }

    // Stop tracking the mouse movements
    function stopTracking(){
        mouseview.datalogger.tracking = false
        cancelAnimationFrame(mouseview.animator_raf)
        mouseview.timing.finishTime = window.performance.now()
    }

    // current aperture position in page coordinates, null until the mouse has moved
    function pagePosition(){
        var x = mouseview.datalogger.x, y = mouseview.datalogger.y
        return {
            x: x == null ? null : x + mouseview.params.offset.X,
            y: y == null ? null : y + mouseview.params.offset.Y
        }
    }

    // logging data (page coordinates)
    function logPosition(xpos, ypos, timestamp){
        mouseview.datalogger.data.push({
            x: xpos,
            y: ypos,
            time: timestamp - mouseview.timing.startTime,
            event: 'sample'
        })
    }

    // log a random event
    function logEvent(event_string){
        var pos = pagePosition()
        mouseview.datalogger.data.push({
            x: pos.x,
            y: pos.y,
            time: window.performance.now() - mouseview.timing.startTime,
            event: event_string
        })
    }

    // event handler for orientation changes
    function orientationHandler(event){
            if (event.beta == null || event.gamma == null) { return }
            var y = event.beta;  // In degree in the range [-180,180)
            var x = event.gamma; // In degree in the range [-90,90)
            // Because we don't want to have the device upside down
            // We constrain the x and y values to the range [-90,90]
            x = Math.min(90, Math.max(-90, x))
            y = Math.min(90, Math.max(-90, y))

            x += 90;
            y += 90;

            //scale the angle to orientation coordinates
            x = mouseview.params.overWidth * (x/180)
            y = mouseview.params.overHeight * (y/180)

            setPosition(x, y)
    }

    // iOS 13+ only fires deviceorientation after permission is granted from a user gesture (e.g. a button click)
    function requestTiltPermission(){
        if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function'){
            return DeviceOrientationEvent.requestPermission().then(function(state){ return state === 'granted' }, function(){ return false })
        }
        return Promise.resolve(!!window.DeviceOrientationEvent)
    }

    //storing data locally (helpful for multiple pages)
    function storeData(){
        localStorage.setItem("mouseview_data", JSON.stringify({
            format: 2,
            path: window.location.pathname,
            renderer: mouseview.datalogger.renderer,
            apertureMode: mouseview.datalogger.apertureMode,
            data: mouseview.datalogger.data
        }));
    }

    //getting local data (helpful for plotting data)
    function getData(){
        var stored = JSON.parse(localStorage.getItem("mouseview_data") || "[]");
        if (Array.isArray(stored)){
            // stored by MouseView.js <= 0.1.x, with the page path mixed into the array
            mouseview.datalogger.path = stored.filter(function(d){ return typeof d === 'string' })[0] || null
            mouseview.datalogger.data = stored.filter(function(d){ return d !== null && typeof d === 'object' })
        } else {
            mouseview.datalogger.path = stored.path || null
            mouseview.datalogger.renderer = stored.renderer || null
            mouseview.datalogger.apertureMode = stored.apertureMode || null
            mouseview.datalogger.data = stored.data || []
        }
    }

    function clearData(){
        mouseview.datalogger.data = []
    }

    // plot a heatmap of the x and y coordinates
    function plotHeatMap(){

        // remove old heatmap if there
        clearHeatmap()

        // the data are page coordinates, so the heatmap covers the whole page
        var body = document.body, html = document.documentElement
        var width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth)
        var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)

        var overlay = document.createElement('canvas') // create canvas element

        //set settings
        overlay.id = "heatmap";
        overlay.width = width
        overlay.height = height
        overlay.style.zIndex = 999999;
        overlay.style.position = 'absolute';
        overlay.style.display = 'block';
        overlay.style.top = '0px'
        overlay.style.left = '0px'
        overlay.style.pointerEvents = 'none'

        document.body.appendChild(overlay)// show the layer

        // get data into expected format for simplheat (list of lists [[x,y,1],....])
        var formattedArray = []
        for (var i = 0; i < mouseview.datalogger.data.length; i++) {
            var d = mouseview.datalogger.data[i]
            if (d && d.x != null && d.y != null) { formattedArray.push([d.x, d.y, 1]) }
        }


        //pass canvas and data to simpleheat
        var heat = simpleheat(overlay)
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

    mouseview.pauseUpdating = () => {
        pauseUpdating()
    }

    mouseview.resumeUpdating = () => {
        resumeUpdating()
    }

    mouseview.hide = () => {
        hide()
    }

    mouseview.show = () => {
        show()
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

    mouseview.logEvent = (event_txt) => {
        logEvent(event_txt)
    }

    mouseview.updateOverlayCanvas = () => {
        updateOverlayCanvas()
    }

    mouseview.checkSupport = () => {
        return checkSupport()
    }

    mouseview.requestTiltPermission = () => {
        return requestTiltPermission()
    }

    // shared with MouseView-fallback.js and the parity test, not part of the public API
    mouseview._internals = {
        discCoverage: discCoverage,
        apertureRadii: apertureRadii,
        apertureWeights: apertureWeights,
        profileOptions: profileOptions,
        buildProfile: buildProfile,
        overlayZ: OVERLAY_Z
    }

    //bundled dependencies 
    
    // simple heat
    function simpleheat(canvas) {
    if (!(this instanceof simpleheat)) return new simpleheat(canvas);

    this._canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

    this._ctx = canvas.getContext('2d');
    this._width = canvas.width;
    this._height = canvas.height;

    this._max = 1;
    this._data = [];
}

    simpleheat.prototype = {

        defaultRadius: 25,

        defaultGradient: {
            0.4: 'blue',
            0.6: 'cyan',
            0.7: 'lime',
            0.8: 'yellow',
            1.0: 'red'
        },

        data: function (data) {
            this._data = data;
            return this;
        },

        max: function (max) {
            this._max = max;
            return this;
        },

        add: function (point) {
            this._data.push(point);
            return this;
        },

        clear: function () {
            this._data = [];
            return this;
        },

        radius: function (r, blur) {
            blur = blur === undefined ? 15 : blur;

            // create a grayscale blurred circle image that we'll use for drawing points
            var circle = this._circle = this._createCanvas(),
                ctx = circle.getContext('2d'),
                r2 = this._r = r + blur;

            circle.width = circle.height = r2 * 2;

            ctx.shadowOffsetX = ctx.shadowOffsetY = r2 * 2;
            ctx.shadowBlur = blur;
            ctx.shadowColor = 'black';

            ctx.beginPath();
            ctx.arc(-r2, -r2, r, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();

            return this;
        },

        resize: function () {
            this._width = this._canvas.width;
            this._height = this._canvas.height;
        },

        gradient: function (grad) {
            // create a 256x1 gradient that we'll use to turn a grayscale heatmap into a colored one
            var canvas = this._createCanvas(),
                ctx = canvas.getContext('2d'),
                gradient = ctx.createLinearGradient(0, 0, 0, 256);

            canvas.width = 1;
            canvas.height = 256;

            for (var i in grad) {
                gradient.addColorStop(+i, grad[i]);
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1, 256);

            this._grad = ctx.getImageData(0, 0, 1, 256).data;

            return this;
        },

        draw: function (minOpacity) {
            if (!this._circle) this.radius(this.defaultRadius);
            if (!this._grad) this.gradient(this.defaultGradient);

            var ctx = this._ctx;

            ctx.clearRect(0, 0, this._width, this._height);

            // draw a grayscale heatmap by putting a blurred circle at each data point
            for (var i = 0, len = this._data.length, p; i < len; i++) {
                p = this._data[i];
                ctx.globalAlpha = Math.min(Math.max(p[2] / this._max, minOpacity === undefined ? 0.05 : minOpacity), 1);
                ctx.drawImage(this._circle, p[0] - this._r, p[1] - this._r);
            }

            // colorize the heatmap, using opacity value of each pixel to get the right color from our gradient
            var colored = ctx.getImageData(0, 0, this._width, this._height);
            this._colorize(colored.data, this._grad);
            ctx.putImageData(colored, 0, 0);

            return this;
        },

        _colorize: function (pixels, gradient) {
            for (var i = 0, len = pixels.length, j; i < len; i += 4) {
                j = pixels[i + 3] * 4; // get gradient color from opacity value

                if (j) {
                    pixels[i] = gradient[j];
                    pixels[i + 1] = gradient[j + 1];
                    pixels[i + 2] = gradient[j + 2];
                }
            }
        },

        _createCanvas: function () {
            if (typeof document !== 'undefined') {
                return document.createElement('canvas');
            } else {
                // create a new canvas instance in node.js
                // the canvas class needs to have a default constructor without any parameter
                return new this._canvas.constructor();
            }
        }
};              

}(window));
