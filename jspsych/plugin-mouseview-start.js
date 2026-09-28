/*
 * plugin-mouseview-start
 *
 * MouseView.js start overlay and tracking plugin, for jsPsych 7 and 8.
 * For jsPsych 6 use examples/jspsych/jspsych-mouseview-start.js
 * documentation: https://mouseview.org
 */

var jsPsychMouseviewStart = (function (jspsych) {
    'use strict';

    var info = {
        name: 'mouseview-start',
        version: '0.4.0',
        parameters: {
            /** The size of the view-window, a percentage string or a number of pixels */
            aperture_size: { type: jspsych.ParameterType.STRING, default: '5%' },
            /** The SD in pixels of the gaussian edge of the aperture */
            aperture_gauss: { type: jspsych.ParameterType.INT, default: 10 },
            /** 'classic' draws the aperture as MouseView.js 0.1.x did, 'clear' makes the aperture fully clear */
            aperture_mode: { type: jspsych.ParameterType.STRING, default: 'classic' },
            /** 'move' makes the aperture follow the mouse/finger, 'click' moves it only on a click/tap */
            update_mode: { type: jspsych.ParameterType.STRING, default: 'move' },
            /** The colour of the overlay */
            overlay_colour: { type: jspsych.ParameterType.STRING, default: 'Black' },
            /** The opacity of the overlay, from 0 to 1 */
            overlay_alpha: { type: jspsych.ParameterType.FLOAT, default: 0.8 },
            /** The SD in pixels of the blur applied to the page under the overlay */
            overlay_gaussian: { type: jspsych.ParameterType.INT, default: 20 },
            /** ms between recaptures of the page, only used by the fallback renderer */
            overlay_gaussian_update: { type: jspsych.ParameterType.INT, default: 500 },
            /** If the browser cannot blur the overlay: 'fail' ends the experiment, 'fallback' uses the slower screenshot renderer, 'allow' carries on without blur */
            blur_unsupported: { type: jspsych.ParameterType.STRING, default: 'fail' },
            /** Shown when the experiment ends because the overlay cannot be displayed */
            unsupported_message: {
                type: jspsych.ParameterType.HTML_STRING,
                default: 'Sorry, your browser cannot display this experiment. Please try again using an up-to-date version of Chrome, Edge, Firefox or Safari.'
            },
            /** Where to load MouseView.js from, if it is not already on the page */
            mouseview_url: { type: jspsych.ParameterType.STRING, default: 'https://mouseview.org/MouseView.js' }
        },
        data: {
            window_h: { type: jspsych.ParameterType.INT },
            window_w: { type: jspsych.ParameterType.INT },
            /** 'css', 'css-noblur' or 'fallback' */
            renderer: { type: jspsych.ParameterType.STRING },
            aperture_mode: { type: jspsych.ParameterType.STRING }
        }
    };

    class MouseviewStartPlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {
            var jsPsych = this.jsPsych;

            var setup = function () {
                var mouseview = window.mouseview;
                mouseview.clearData(); // each start/stop pair records its own data
                mouseview.params.apertureSize = trial.aperture_size;
                mouseview.params.apertureGauss = trial.aperture_gauss;
                mouseview.params.apertureMode = trial.aperture_mode;
                mouseview.params.updateMode = trial.update_mode;
                mouseview.params.overlayColour = trial.overlay_colour;
                mouseview.params.overlayAlpha = trial.overlay_alpha;
                mouseview.params.overlayGaussian = trial.overlay_gaussian;
                mouseview.params.overlayGaussianInterval = trial.overlay_gaussian_update;
                mouseview.params.blurUnsupported = trial.blur_unsupported;
                mouseview.params.onBlurUnsupported = function () {
                    mouseview.removeAll();
                    // abortExperiment is jsPsych 8, endExperiment is jsPsych 7
                    var end = jsPsych.abortExperiment || jsPsych.endExperiment;
                    end.call(jsPsych, trial.unsupported_message);
                };
                mouseview.params.overlayGaussianFunc = function () {
                    mouseview.startTracking();
                    jsPsych.finishTrial({
                        window_h: mouseview.params.overHeight,
                        window_w: mouseview.params.overWidth,
                        renderer: mouseview.datalogger.renderer,
                        aperture_mode: mouseview.datalogger.apertureMode
                    });
                };
                mouseview.init();
            };

            if (window.mouseview && typeof window.mouseview.init === 'function') {
                setup();
            } else {
                var el = document.createElement('script');
                el.onload = setup;
                el.onerror = function () {
                    var end = jsPsych.abortExperiment || jsPsych.endExperiment;
                    end.call(jsPsych, 'Could not load MouseView.js from ' + trial.mouseview_url);
                };
                el.src = trial.mouseview_url;
                document.head.appendChild(el);
            }
        }
    }
    MouseviewStartPlugin.info = info;

    return MouseviewStartPlugin;
})(jsPsychModule);
