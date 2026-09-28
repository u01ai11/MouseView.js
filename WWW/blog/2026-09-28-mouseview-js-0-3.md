---
slug: MouseView.js 0.3
title: "MouseView.js 0.3: A New Blur, Working Demos and jsPsych 8"
author: Alex Anwyl-Irvine
author_url: https://twitter.com/alexanderirvine
author_image_url: https://user-images.githubusercontent.com/9372039/110255157-484aad00-7f8a-11eb-8a1e-c7b1fcbc3188.png
tags: [MouseView, news, release]
---

It's been a while! Thanks to Claude Code, MouseView.js 0.3 is out, and it's the biggest update since we launched. The headline: the Gaussian blur has been completely rebuilt, and it's finally something we're happy for you to use.

<!-- truncate -->

## Remember the blur warning?

For a long time the README said please **don't use the Gaussian blur without contacting us**. You have been warned, etc.

That was because the blur worked by taking a screenshot of the whole page (with a library called html2canvas), blurring it, and drawing it over the top. This had some problems:

- It took a new screenshot every time you scrolled. If you set it to refresh on a timer and weren't recording yet, it took about 60 screenshots a second.
- Anything that changed on the page, like videos, animations or text being typed, didn't show up in the blur until the next screenshot.
- Images and iframes from other websites came out blank.
- In Safari before version 18 there was no blur at all. Participants just saw the page.

That last one is not great for a research tool!

## The new blur

Browsers can now blur whatever is behind an element with CSS (`backdrop-filter`), and cut shapes out of it with a mask. So the overlay is now two layers sitting on top of the page, with a soft hole cut around the mouse. There's no screenshot at all.

This means:

- The page under the blur is live. Videos keep playing, animations keep moving, and it all updates as it happens.
- Scrolling costs nothing.
- Iframes from other sites get blurred too, so the [iframe demo](https://mouseview.org/demo_iframe.html) has its blur back.
- MouseView.js went from 400 KB to 34 KB. 🎉

## It looks the same as before

This was the important bit. If you've run a study with MouseView.js, you don't want your next one to look different.

So we measured the old overlay pixel by pixel, and the new one matches it. Doing this turned up something we hadn't noticed: with the default settings (80% black overlay plus blur) the old aperture was never completely clear. About 30% of the overlay stays in the middle, because the old code cut two holes of different sizes. The new default, `apertureMode: 'classic'`, keeps that exactly as it was, so your results stay comparable.

If you'd prefer a properly clear aperture for a new study, set `apertureMode: 'clear'`.

There's also a test page (`test/parity.html`) that checks the new overlay against the old drawing over 144 combinations of settings, so it stays that way.

## No more silently unblurred participants

If a participant's browser can't draw the blur, MouseView.js no longer just carries on without it. You choose what happens with `blurUnsupported`:

- `'fail'` (the default) shows a message and doesn't start the task. In jsPsych it ends the experiment.
- `'fallback'` loads `MouseView-fallback.js`, which uses the old screenshot method (with an updated html2canvas, and the worst bugs fixed).
- `'allow'` carries on without blur. Only use this if the blur isn't part of your stimulus!

You can also check a browser in advance with `mouseview.checkSupport()`, for example on your consent page. And the renderer that was used is saved with the data, so you can report it or exclude people.

## The demos work again

The [demo](https://mouseview.org/demo.html) had been broken for a while. Turning the overlay off and on stacked up more and more copies of it behind the scenes, and the iframe demo had a security hole. Both are fixed. The mobile tilt demo now asks for permission on iPhones, which it needs to do since iOS 13.

## jsPsych 7 and 8

There are new plugins for jsPsych 7 and 8, with examples. The jsPsych 6 plugins still work with the same names and settings, so existing experiments shouldn't need any changes. Checkout the [jsPsych docs](/docs/jsPsych) for details.

## Changes to the data

A few things about the data are different. Have a look if you're comparing with data from an older version:

- `x` and `y` are now positions on the page, so they include scrolling. If your page doesn't scroll, nothing changes.
- Samples taken before the mouse has moved are `null` rather than `0`.
- `logEvent` records the time you called it, not the time of the last sample.
- Data saved with `storeData()` has a new format, but `getData()` can still read the old one.

The full list is in the [changelog](https://github.com/u01ai11/MouseView.js/blob/master/CHANGELOG.md).

## Other bits

- You can load MouseView.js with a normal `<script>` tag, and `import` from `MouseView.mjs` actually works now.
- No more console messages on every frame.
- The heatmap covers the whole page.
- This website has been updated too.

Thanks to everyone who reported issues, and to [Sajjad Mazaheri](https://github.com/sajjad-mazaheri) for the fixes in [#41](https://github.com/u01ai11/MouseView.js/pull/41). If anything looks off, please [open an issue](https://github.com/u01ai11/MouseView.js/issues)!
