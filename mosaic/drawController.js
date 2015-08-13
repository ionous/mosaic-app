'use strict';

//
// we listen to the map service for changes, 
// expecting that the drop service is just one way a tile might be placed.
// 
angular.module('mosaic')
  .controller('DrawController',
    function(MapService, TileService, $element, $log, $scope) {
      // alt: target the correct scope with 'tilePlaced'
      var index = $scope.$index;
      var sizes = $scope.layerSizes;
      if (angular.isUndefined(sizes) || angular.isUndefined(index)) {
        throw new Error("DrawController must exist in the scope of CanviiController");
      }

      var size = sizes[index];
      $scope.$on('tilePlaced', function(evt, cell) {
        if (!pt_eq(cell.grid.layer.cellSize, size)) {
          //$log.info("didnt matched layer", cell.grid.layer.cellSize, size);
        } else {
          var canvas = $element[0];
          var pos = cell.cellPos();
          var rot = cell.tileRot();
          $log.info("placed", canvas.id, cell.cellIndex(), pos, rot);
          //
          TileService.getSpriteById(cell.tileId(), cell.tileIndex()).then(function(sprite) {
            var ctx = canvas.getContext("2d");
            sprite.clearAt(ctx, pos);
            sprite.drawAt(ctx, pos, rot);
          }, function() {
            $log.info("rejected!");
          });
        }
      });
    });
