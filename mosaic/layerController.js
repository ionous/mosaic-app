'use strict';


//
// generate mouse coordinates for canvases
//
angular.module('mosaic')
  .controller('LayerController',
    function($element, $log, $scope) {
      $scope.coords = {
        x: 0,
        y: 0
      };
      $scope.mouse = {
        x: 0,
        y: 0
      };
      $scope.step = {
        size: 32,
      };

      // return clipped x,y position on the passed canvas in steps of gran.
      $scope.canvasPos = function(canvas, cx, cy, gran) {
        var rect = canvas.getBoundingClientRect();
        var right = canvas.width;
        var bottom = canvas.height

        //var sx = cw / canvas.clientWidth;
        //var sy = ch / canvas.clientHeight;

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
        if (gran) {
          x = Math.floor(0.5 + x / gran) * gran;
          y = Math.floor(0.5 + y / gran) * gran;
          right -= gran;
          bottom -= gran;
        } else {
          right -= 1;
          bottom -= 1;
        }
        if (x>right) {
          x= right;
          clippedX= true;
        }
        if (y>bottom) {
          y= bottom;
          clippedY= true;
        }
        return {
          x: x,
          y: y,
          clippedX: clippedX,
          clippedY: clippedY,
        };
      }

      // record the current mouse and step positions.
      $scope.canvasMove = function(evt) {
        var el = evt.target;
        var pos = $scope.canvasPos(el, evt.clientX, evt.clientY);
        $scope.mouse = {
          x: pos.x,
          y: pos.y
        };
        var size = $scope.step.size;
        var gran = $scope.canvasPos(el, evt.clientX, evt.clientY, size);
        $scope.coords = {
          x: 1 + gran.x / size,
          y: 1 + gran.y / size
        };
      };
    });
