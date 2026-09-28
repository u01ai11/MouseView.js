/*
 * jspsych-mouseview-start
 * Alex Anwyl-Irvine
 *
 * Mouseview.js Start overlay and tracking plugin, for jsPsych 6.
 * For jsPsych 7 and 8 use jspsych/plugin-mouseview-start.js
 * documentation: www.github.com/u01ai11/MouseView.js
 */

jsPsych.plugins["Mouseview-Start"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "Mouseview-Start",
    parameters: {
      aperture_size: {
        type: jsPsych.plugins.parameterType.STRING, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO,
        default: "5%",
        description: "The percentage size of the view-window for mouse tracking"
      },
      aperture_gauss: {
        type: jsPsych.plugins.parameterType.INT,
        default: 10,
        description: "The SD of the gaussian blur for edge of the overlay apperture"
      },
      aperture_mode: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "classic",
        description: "'classic' draws the aperture as MouseView.js 0.1.x did, 'clear' makes the aperture fully clear"
      },
      overlay_colour: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "Black",
        description: "The colour of the obsfucation overlay"
      },
      overlay_alpha: {
        type: jsPsych.plugins.parameterType.FLOAT,
        default: 0.8,
        description: "The transparancy from 0-1 of the obverlay"
      },
      overlay_gaussian: {
        type: jsPsych.plugins.parameterType.INT,
        default: 20,
        description: "The SD of the gaussian blur for the content underneath the overlay"
      },
      overlay_gaussian_update: {
        type: jsPsych.plugins.parameterType.INT,
        default: 500,
        description: "The millisecond interval to wait for recapturing underneath for the blurring (only used by the fallback renderer)"
      },
      blur_unsupported: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "fail",
        description: "If the browser cannot blur the overlay: 'fail' ends the experiment, 'fallback' uses the slower screenshot renderer, 'allow' carries on without blur"
      },
      unsupported_message: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        default: "Sorry, your browser cannot display this experiment. Please try again using an up-to-date version of Chrome, Edge, Firefox or Safari.",
        description: "Shown when the experiment ends because the overlay cannot be displayed"
      },
      mouseview_url: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "https://mouseview.org/MouseView.js",
        description: "Where to load MouseView.js from, if it is not already on the page"
      }
    }
  }

  plugin.trial = function(display_element, trial) {


    // define callback for when overlay complete
    var on_complete = () => {
        var trial_data = {
            window_h: mouseview.params.overHeight,
            window_w: mouseview.params.overWidth,
            renderer: mouseview.datalogger.renderer,
            aperture_mode: mouseview.datalogger.apertureMode
        }
        mouseview.startTracking() // start tracking mouse movements
        jsPsych.finishTrial(trial_data) // log the height and width then move on
    }


    var setup_mouseview = () => {
            mouseview.clearData() // each start/stop pair records its own data
            mouseview.params.apertureSize = trial.aperture_size
            mouseview.params.apertureGauss = trial.aperture_gauss
            mouseview.params.apertureMode = trial.aperture_mode
            mouseview.params.overlayColour = trial.overlay_colour
            mouseview.params.overlayAlpha = trial.overlay_alpha
            mouseview.params.overlayGaussian = trial.overlay_gaussian
            mouseview.params.overlayGaussianInterval = trial.overlay_gaussian_update
            mouseview.params.overlayGaussianFunc = on_complete
            mouseview.params.blurUnsupported = trial.blur_unsupported
            mouseview.params.onBlurUnsupported = () => {
                mouseview.removeAll()
                jsPsych.endExperiment(trial.unsupported_message)
            }
            mouseview.init()
    }

    if (window.mouseview && typeof window.mouseview.init === 'function') {
        setup_mouseview()
    } else {
        var el = document.createElement('script')
        el.onload  = setup_mouseview
        el.src = trial.mouseview_url
        document.head.appendChild(el)
    }


  };

  return plugin;
})();
