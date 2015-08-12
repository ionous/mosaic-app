'use strict';

//
// we listen to the map service for changes, 
// expecting that the drop service is just one way a tile might be placed.
// 
angular.module('mosaic')
  .controller('DrawController',
    function(MapService, TileService, $element, $log, $scope) {
      var canvas = $element[0];
      $scope.$on('tilePlaced', function(evt, layer, grid, cell) {
        var d = grid[cell];
        var tile = d[0];
        var index = d[1];
        var rot = d[2];
        //
        var pos= layer.cellPos(cell);
        $log.info("placed", cell, pos);
        //
        var sprite = TileService.getSprite(tile, index);
        var ctx = $element[0].getContext("2d");
        sprite.clearAt(ctx, pos);
        sprite.drawAt(ctx, pos, rot);
      });
    });
