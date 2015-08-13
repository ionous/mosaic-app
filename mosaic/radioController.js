'use strict';

angular.module('mosaic')
  .controller('RadioController',
    function(StepService, $scope) {
      var sizes = $scope.layerSizes;
      if (angular.isUndefined(sizes)) {
        throw new Error("expected to RadioController in LayerController");
      }
      $scope.stepIndex = function(set) {
        // set the current size from an index.
        if (!angular.isUndefined(set)) {
          StepService.step(set ? sizes[set] : false);
        } else {
          // return the current step size as an index into sizes
          var ret=0; // auto, default
          var step = StepService.step();
          if (step) {
            for (var i = 0; i < sizes.length; i++) {
              var sz = sizes[i];
              if (pt_eq(step, sizes[i])) {
                  ret = i;
                  break;
                } // pt
              } // loop
            }
            return ret;
          }
        }
      });
