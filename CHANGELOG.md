# Changelog

## 0.2.0

### The overlay no longer uses screenshots
The blurred overlay is now drawn with CSS (`backdrop-filter` and `mask-image`) instead of an html2canvas screenshot drawn on a canvas. `MouseView.js` has gone from 400 KB to about 35 KB.

- The page under the overlay stays live: videos, animations, form input and other changes are blurred as they happen, and cross-origin images and iframes are blurred too (they used to come out blank).
- Scrolling and resizing no longer re-screenshot the whole page. `overlayGaussianFunc` is called almost straight away after `init()`.
- The blur now works in Safari. Safari before version 18 has no canvas `filter`, so 0.1.x showed Safari users an unblurred page.
- The page no longer shows through, unblurred, along the edges of the window.

### Same look by default (`apertureMode`)
With the default `apertureMode: 'classic'` the overlay looks the same as in 0.1.x, including the parts that may be surprising: the aperture is not completely clear when `overlayAlpha` is above 0 (about 30% of the overlay colour remains in its centre at 0.8), and the overlay colour is cut back over a wider radius than the blur. `test/parity.html` checks this against the 0.1.x canvas drawing over a range of settings. The new `apertureMode: 'clear'` gives a single, fully clear aperture.

### Browsers that cannot draw the blur (`blurUnsupported`)
New `params.blurUnsupported`, default `'fail'`: if the browser cannot draw the blur, a message is shown and `overlayGaussianFunc` is never called, so a task never runs with the stimulus silently degraded. `'fallback'` loads the new `MouseView-fallback.js` (html2canvas 1.4.1 with the 0.1.x canvas drawing, fixed to recapture sensibly), and `'allow'` carries on without the blur. New `params.onBlurUnsupported`, `params.blurUnsupportedMessage`, `params.fallbackUrl` and `mouseview.checkSupport()`. The renderer used is recorded in `mouseview.datalogger.renderer` and saved with the data.

### Data changes (check these if you compare with data from 0.1.x)
- `x` and `y` are now page coordinates for both samples and events. In 0.1.x samples were viewport coordinates and events were in a mix of the two after scrolling. Nothing changes on pages that do not scroll.
- Samples taken before the mouse has moved have `x` and `y` of `null`. In 0.1.x they were `0`.
- `logEvent` records the time it was called. In 0.1.x it recorded the time of the last sample.
- `storeData` saves `{format: 2, path, renderer, apertureMode, data}` instead of mixing the page path into the data array. `getData` reads both formats, and puts the path in `mouseview.datalogger.path`.
- The first sample can no longer have a negative time.

### Fixes
- `removeAll()` now removes the overlay, its listeners and any pending work, so `init()` can be called again (the demo's toggle used to stack listeners and throw).
- `MouseView.js` can be loaded with a plain `<script>` tag in `<head>` (it used to crash unless loaded as `type="module"`).
- `MouseView.mjs` has real exports, so `import * as mouseview from './MouseView.mjs'` works.
- No more console logging on every frame while tracking, or when starting and stopping.
- The heatmap covers the whole page and no longer changes the overlay's size.
- Tilt: new `mouseview.requestTiltPermission()` for iOS, and the aperture stays on screen.
- `demo_iframe.html` no longer loads the page named in its URL (this allowed script injection).

### jsPsych
- New plugins for jsPsych 7 and 8 in `jspsych/`.
- The jsPsych 6 plugins keep their names and parameters. New optional parameters: `aperture_mode`, `blur_unsupported` (default `'fail'`, which ends the experiment with `unsupported_message`) and `mouseview_url`. `renderer` and `aperture_mode` are added to the trial data.
- MouseView.js is only loaded once per experiment. Each start trial still clears the data, as before.

### Removed
- `mouseview.h2canv_opts` and `mouseview.screen_canvas`.
- `overlayGaussianInterval` is only used by the fallback renderer.
