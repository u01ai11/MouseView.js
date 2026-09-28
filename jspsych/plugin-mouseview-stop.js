/*
 * plugin-mouseview-stop
 *
 * MouseView.js stop tracking, remove the overlay and save the data, for jsPsych 7 and 8.
 * For jsPsych 6 use examples/jspsych/jspsych-mouseview-stop.js
 * documentation: https://mouseview.org
 */

var jsPsychMouseviewStop = (function (jspsych) {
    'use strict';

    var info = {
        name: 'mouseview-stop',
        version: '0.4.0',
        parameters: {},
        data: {
            /** x position of each sample and event, in page pixels */
            X: { type: jspsych.ParameterType.INT, array: true },
            /** y position of each sample and event, in page pixels */
            Y: { type: jspsych.ParameterType.INT, array: true },
            /** ms since tracking started */
            Time: { type: jspsych.ParameterType.FLOAT, array: true },
            /** 'sample', or the text passed to mouseview.logEvent */
            Event: { type: jspsych.ParameterType.STRING, array: true },
            /** 'css', 'css-noblur' or 'fallback' */
            renderer: { type: jspsych.ParameterType.STRING },
            aperture_mode: { type: jspsych.ParameterType.STRING }
        }
    };

    class MouseviewStopPlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {
            var mouseview = window.mouseview;
            mouseview.stopTracking();
            mouseview.removeAll();

            var data = mouseview.datalogger.data;
            this.jsPsych.finishTrial({
                X: data.map(function (d) { return d.x; }),
                Y: data.map(function (d) { return d.y; }),
                Time: data.map(function (d) { return d.time; }),
                Event: data.map(function (d) { return d.event; }),
                renderer: mouseview.datalogger.renderer,
                aperture_mode: mouseview.datalogger.apertureMode
            });
        }
    }
    MouseviewStopPlugin.info = info;

    return MouseviewStopPlugin;
})(jsPsychModule);
