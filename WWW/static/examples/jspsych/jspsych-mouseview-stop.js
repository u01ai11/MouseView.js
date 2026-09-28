/*
 * jspsych-mouseview-stop
 * Alex Anwyl-Irvine
 *
 * Mouseview.js Stop tracking and overlay, get data. For jsPsych 6.
 * For jsPsych 7 and 8 use jspsych/plugin-mouseview-stop.js
 * documentation: www.github.com/u01ai11/MouseView.js
 */

jsPsych.plugins["Mouseview-Stop"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "Mouseview-Stop",
    parameters: {
    }
  }

  plugin.trial = function(display_element, trial) {
      // stop the storage of data
      mouseview.stopTracking()
      mouseview.removeAll()
      // get all the X and Y and Time values
      var X = []
      var Y = []
      var T = []
      var E = []
      // loop through stored data
      for (var i = 0; i < mouseview.datalogger.data.length; i++) {
          X.push(mouseview.datalogger.data[i].x)
          Y.push(mouseview.datalogger.data[i].y)
          T.push(mouseview.datalogger.data[i].time)
          E.push(mouseview.datalogger.data[i].event)
        }

      var trial_data = {
          X: X,
          Y: Y,
          Time: T,
          Event: E,
          renderer: mouseview.datalogger.renderer,
          aperture_mode: mouseview.datalogger.apertureMode
      }

      jsPsych.finishTrial(trial_data)
  };

  return plugin;
})();
