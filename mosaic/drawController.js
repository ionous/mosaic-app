'use strict';

//
// we listen to the map service for changes, 
// expecting that the drop service is just one way a tile might be placed.
// 
angular.module('mosaic')
  .controller('DrawController',
    function(MapService, TileService, $element, $log, $scope) {
      var canvas = $element[0];
      $scope.$on('tilePlaced', function(evt, cell) {
        //
        var pos = cell.cellPos();
        var rot = cell.tileRot();
        $log.info("placed", cell.cellIndex(), pos, rot);
        //
        TileService.getSpriteById(cell.tileId(), cell.tileIndex()).then(function(sprite) {
          $log.info("drawing...");
          var ctx = $element[0].getContext("2d");
          sprite.clearAt(ctx, pos);
          sprite.drawAt(ctx, pos, rot);
        }, function() {
          $log.info("rejected!");
        });
      });
    });
