'use strict';


/**
 * @fileoverview StepService
 * uses DragService to calculate a default stepsize.
 */
angular.module('mosaic')
  .factory('StepService',
    function(DragService, $log) {
      var currentStep = false;
      var stepService = {

        // get or set the step size
        // a step size of false means use the current drag size.
        // otherwise, expects the size to be {x,y}
        step: function(set) {
          if (!angular.isUndefined(set)) {
            currentStep = set;
          }
          return currentStep;
        },

        dragStep: function() {
          return currentStep ? currentStep : DragService.sprite ? {
            x: DragService.sprite.width,
            y: DragService.sprite.height
          }: false;
        },

        // return clipped x,y position on the passed canvas, optionally in steps.
        canvasPos: function(canvas, pos, step) {
          var cx = pos.x;
          var cy = pos.y;
          var rect = canvas.getBoundingClientRect();
          var right = canvas.width;
          var bottom = canvas.height
          var x = Math.floor(cx - rect.left);
          var y = Math.floor(cy - rect.top);
          var clippedX = x < 0;
          if (clippedX) {
            x = 0;
          }
          var clippedY = y < 0;
          if (clippedY) {
            y = 0;
          }
          if (step) {
            x = Math.floor(0.5 + x / step.x) * step.x;
            y = Math.floor(0.5 + y / step.y) * step.y;
            right -= step.x;
            bottom -= step.y;
          } else {
            right -= 1;
            bottom -= 1;
          }
          if (x > right) {
            x = right;
            clippedX = true;
          }
          if (y > bottom) {
            y = bottom;
            clippedY = true;
          }
          return {
            x: x,
            y: y,
            clippedX: clippedX,
            clippedY: clippedY,
          };
        }
      };
      return stepService;
    }); // factory
