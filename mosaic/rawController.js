'use strict';

// get raw map data.
angular.module('mosaic')
  .controller('RawController',
    function(MapService, $log, $rootScope, $scope) {
      $scope.mapData = MapService.mapData();
      $rootScope.$on('tilePlaced', function(evt) {
        // FIX: its recomputing every mouse move!?!
        $log.info("reseting json data...");
        $scope.mapData = MapService.mapData();
      });
    });
