/*
 * jspsych-mouseview-stop 
 * Alex Anwyl-Irvine
 *
 * Mouseview.js Stop tracking and overlay, get data
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
      // loop through stored data
      for (var i = 0; i < mouseview.datalogger.data.length; i++) {
          X.push(mouseview.datalogger.data[i].x)
          Y.push(mouseview.datalogger.data[i].y)
          T.push(mouseview.datalogger.data[i].time)
        }
      
      var trial_data = {
          X: X,
          Y: Y,
          Time: T
      }
      
      jsPsych.finishTrial(trial_data)
  };

  return plugin;
})();