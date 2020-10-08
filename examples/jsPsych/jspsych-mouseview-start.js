/*
 * jspsych-mouseview-start 
 * Alex Anwyl-Irvine
 *
 * Mouseview.js Start overlay and tracking plugin
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
        description: "The millisecond interval to wait for recapturing underneath for the blurring"
      }
    }
  }

  plugin.trial = function(display_element, trial) {      
      
      
    // define callback for when overlay complete
    var on_complete = () => {
        var trial_data = {
            window_h: mouseview.params.overHeight,
            window_w: mouseview.params.overWidth
        }
        mouseview.startTracking() // start tracking mouse movements
        jsPsych.finishTrial(trial_data) // log the height and width then move on 
    }
    // create element and append to body
    var js = document.createElement("script");
    js.type = "module";
    js.src = "https://mouseview.netlify.app/MouseView.js";
    document.body.appendChild(js);

    setTimeout(function(){
        mouseview.params.apertureSize = trial.aperture_size
        mouseview.params.apertureGauss = trial.aperture_gauss 
        mouseview.params.overlayColour = trial.overlay_colour
        mouseview.params.overlayAlpha = trial.overlay_alpha
        mouseview.params.overlayGaussian = trial.overlay_gaussian
        mouseview.params.overlayGaussianInterval = trial.overlay_gaussian_update
        mouseview.params.overlayGaussianFunc = on_complete
        mouseview.init()
    }, 500);
    
  };

  return plugin;
})();