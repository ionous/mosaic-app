'use strict';


//
angular.module('mosaic')
  .controller('LayerController',
    function(MapService, StepService, $scope) {

      $scope.layerSize = MapService.layerSize;
      $scope.layerSizes = ["auto", pt(32), pt(8), pt(1)];
      $scope.coords = pt(0);
      $scope.mouse = pt(0);

      $scope.sizeId = function(size) {
        if (size != "auto") {
          size = size.x === size.y ? size.x : '' + size.x + '-' + size.y;
        }
        return size;
      }
      $scope.sizeLabel = function(size) {
        if (size != "auto") {
          size = size.x === size.y ? size.x : '' + size.x + '*' + size.y;
        }
        return size;
      }
      // record the current mouse and step positions.
      // FIX: might be better as a filter ( one for canvasPos, one for granulation. )
      $scope.canvasMove = function(evt) {
        var el = evt.target;
        var mouse = {
          x: evt.clientX,
          y: evt.clientY
        };
        var pos = StepService.canvasPos(el, mouse);
        $scope.mouse = {
          x: pos.x,
          y: pos.y
        };
        var step = StepService.dragStep();
        var gran = StepService.canvasPos(el, mouse, step);
        $scope.coords = {
          x: 1 + gran.x / (step ? step.x : 1),
          y: 1 + gran.y / (step ? step.y : 1)
        };
      };
    });
