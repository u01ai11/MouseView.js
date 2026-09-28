---
id: jsPsych
title: Running MouseView.js experiment on jsPsych
sidebar_label: jsPsych
---

MouseView.js works with jsPsych through a pair of plugins: one starts the overlay and tracking, the other stops them and saves the data into the jsPsych data. Put any trials you want to track between them. You will still have to do your own hosting.

## jsPsych 7 and 8

```html
<script src="https://cdn.jsdelivr.net/npm/jspsych@8.3.0/dist/index.browser.min.js"></script>
<script src="https://mouseview.org/jspsych/plugin-mouseview-start.js"></script>
<script src="https://mouseview.org/jspsych/plugin-mouseview-stop.js"></script>
```

```js
const jsPsych = initJsPsych();
jsPsych.run([
  { type: jsPsychMouseviewStart, aperture_size: '5%', overlay_alpha: 0.8 },
  // ... your trials, you can call mouseview.logEvent('text') in on_start / on_finish
  { type: jsPsychMouseviewStop }
]);
```

A full example is [here](https://mouseview.org/examples/jspsych/experiment-v8.html) ([source](https://github.com/u01ai11/MouseView.js/tree/master/examples/jspsych/experiment-v8.html)).

## jsPsych 6

The original plugins still work, with the same names and parameters: `Mouseview-Start` and `Mouseview-Stop` in [examples/jspsych](https://github.com/u01ai11/MouseView.js/tree/master/examples/jspsych). A jsPsych 6 example is [here](https://mouseview.org/examples/jspsych/experiment.html).

## Parameters

The start plugin takes these parameters (all optional):

| Parameter | Default | Description |
|---|---|---|
| `aperture_size` | `'5%'` | Diameter of the aperture, a percentage string or pixels |
| `aperture_gauss` | `10` | SD in pixels of the aperture's gaussian edge |
| `aperture_mode` | `'classic'` | `'classic'` looks exactly like MouseView.js 0.1.x, `'clear'` gives a fully clear aperture |
| `update_mode` | `'move'` | `'move'` makes the aperture follow the mouse/finger, `'click'` moves it only on a click/tap |
| `overlay_colour` | `'Black'` | Colour of the overlay |
| `overlay_alpha` | `0.8` | Opacity of the overlay, 0 to 1 |
| `overlay_gaussian` | `20` | SD in pixels of the blur under the overlay |
| `overlay_gaussian_update` | `500` | ms between recaptures, only used by the fallback renderer |
| `blur_unsupported` | `'fail'` | If the browser cannot draw the blur: `'fail'` ends the experiment with `unsupported_message`, `'fallback'` uses the slower screenshot renderer, `'allow'` carries on without blur |
| `unsupported_message` | A request to use an up-to-date browser | Shown when the experiment ends because of `blur_unsupported: 'fail'` |
| `mouseview_url` | `'https://mouseview.org/MouseView.js'` | Where to load MouseView.js from, if it is not already on the page |

The start trial saves `window_w`, `window_h`, `renderer` and `aperture_mode`. The stop trial saves the arrays `X`, `Y`, `Time` and `Event` (one entry per sample or logged event), plus `renderer` and `aperture_mode`. `X` and `Y` are page pixels, `Time` is ms since tracking started.
