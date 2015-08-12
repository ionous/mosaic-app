'use strict';

angular.module('mosaic')
  .controller('TileListController',
    function(DragService, TileService, $document, $scope) {
      // asign tiles to the scope
      var tiles = TileService.getTiles();
      tiles.then(function(tiles) {
        $scope.tiles = tiles;
      });

      $scope.onDown = function(evt, tile, index) {
        DragService.startDrag(evt, tile, index);
        evt.preventDefault(); // stops selection of whitespace
      };
    });
