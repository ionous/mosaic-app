'use strict';

// helper to create a map id.
function mapId(x, y) {
  var id = angular.toJson([x, y]);
  return id;
}

// helper for making a point.
function pt(x, y) {
  return {
    x: x,
    y: y || x
  };
}

// a map is a hash of x,y position -> object
var Map = function() {
  this.map = {};
};

// return an element for the passed x,y position, or create one if it doesnt exist.
Map.prototype.getOrCreate = function(x, y, cb) {
  var id = mapId(x, y);
  if (!(id in this.map)) {
    var map = cb(id, x, y);
    this.map[id] = map;
  }
  return this.map[id];
};

// a layer contains a map of grids.
// all grids in the layer have width*height pixels.
var Layer = function(id, cells, pixels) {
  this.id = id;
  this.cells = cells;
  this.pixels = pixels;
  this.cellSize = pt( pixels.x / cells.x, pixels.y / cells.y);
  this.grids = new Map();
};

// return grid based on position.
Layer.prototype.grid = function(pix) {
  var gx = Math.floor(pix.x / this.pixels.x);
  var gy = Math.floor(pix.y / this.pixels.y);
  return this.grids.getOrCreate(gx, gy, function() {
    return [];
  });
};

// return cell index within a grid.
Layer.prototype.cell = function(pix) {
  var px = pix.x % this.pixels.x;
  var cx = Math.floor(px / this.cellSize.x);
  if (cx < 0) {
    cx = this.cells.x + cx;
  }
  var py = pix.y % this.pixels.y;
  var cy = Math.floor(py / this.cellSize.y);
  if (cy < 0) {
    cy = this.cells.y + cy;
  }
  return pt(cx, cy);
};

Layer.prototype.cellIndex = function(cell) {
  return cell.x + (cell.y * this.cells.x);
};

// expand a cell index into a position.
Layer.prototype.cellPos = function(cellIndex) {
  var cy = Math.floor(cellIndex / this.cells.x);
  var cx = cellIndex % this.cells.x;
  return pt(cx * this.cellSize.x, cy * this.cellSize.y);
};

/**
 * @fileoverview MapService
 */
angular.module('mosaic')
  .factory('MapService',
    function($log, $rootScope) {
      // FIX: needs to influence the created canvii
      var cells = pt(16);
      var gridSizes = [pt(32), pt(8), pt(1)];
      // size-> map of grids
      var layers = new Map();

      var mapService = {
        gridSizes: gridSizes,

        // search for a tile size which can best hold the passed pixel position.
        // ( ex. if its a 32 pixel aligned position, use the 32 pixel grid. )
        getTileSize: function(pix) {
           var tileSize = pt(1);
          // might be better to use granularity directly...
          for (var i = 0; i < gridSizes.length; i++) {
            var sz = gridSizes[i];
            if ((pix.x % sz.x === 0) && (pix.y % sz.y === 0)) {
              tileSize = sz;
              break;
            }
          }
          return tileSize;
        },

        // find the grid size which can best hold the passed pixel position.
        getLayer: function(pix) {
          var tileSize= mapService.getTileSize(pix);
          return layers.getOrCreate(tileSize.x, tileSize.y, function(id) {
            var pixels = pt(tileSize.x * cells.x, tileSize.y * cells.y);
            return new Layer(id, cells, pixels);
          });
        },

        // add the passed tile to the world at the passed pixel position with the passed rotation.
        place: function(tile, index, pix, rot) {
          // create the data needed for the map.
          var data = [tile, index, rot];
          // pick the best layer for this position.
          var layer = mapService.getLayer(pix);
          // pick the floating grid within that layer.
          var grid = layer.grid(pix);
          // find the cell index on that grid.
          var cell = layer.cellIndex(layer.cell(pix));
          // store the data.
          grid[cell] = data;
          // let everyone known the map has changed.
          $rootScope.$broadcast('tilePlaced', layer, grid, cell);
        },
      };

      return mapService;
    });
