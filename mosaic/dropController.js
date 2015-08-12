'use strict';

// handle drag and drop via a drag service subscription.
// ( requires LayerController for step size and canvas pos )
angular.module('mosaic')
  .controller('DropController',
    function(DragService, MapService, $element, $scope) {
      var canvas = $element[0];
      var lastPos = {
        x: 0,
        y: 0,
        clippedX: true,
        clippedY: true,
      };
      var lastRot = 0;
      var lastTile;
      var lastIndex = -1;
      var start = function(tileId, tileIdx) {
        $scope.step.size = DragService.sprite.width;
        lastTile = tileId;
        lastIndex = tileIdx;
      };
      var stop = function() {
        // place the tile into the map:
        if (!lastPos.clippedY && !lastPos.clippedX) {
          MapService.place(lastTile, lastIndex, lastPos, lastRot);
        }
        // clear the draw overlay:
        var ctx = canvas.getContext("2d");
        DragService.sprite.clearAt(ctx, lastPos);
      };
      var move = function(dragPos, dragCanvas) {
        var newPos = $scope.canvasPos(canvas, dragPos.x, dragPos.y, $scope.step.size);
        // did we actually move:
        if ((lastPos !== newPos) || (lastRot!= dragPos.rot)) {
          // clear the old position
          var ctx = canvas.getContext("2d");
          DragService.sprite.clearAt(ctx, lastPos);
          // if still in bounds, draw the new:
          if (!newPos.clippedX && !newPos.clippedY) {
            DragService.sprite.drawAt(ctx, newPos, dragPos.rot);
          }
          // update the old position:
          lastPos = newPos;
          lastRot = dragPos.rot;
        }
      };
      // to handle "unsubscribe" we would need a directive maybe, or something 
      // if the controller was on a dynamically expanded templated element.
      DragService.subscribe(start, move, stop);
    });
