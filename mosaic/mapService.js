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

/**
 * a map is a hash of x,y position -> object
 */
var Map = function() {
  this.data = {};
};

// return an element for the passed x,y position, or create one if it doesnt exist.
Map.prototype.getOrCreate = function(x, y, cb) {
  var id = mapId(x, y);
  if (!(id in this.data)) {
    var map = cb(id, x, y);
    this.data[id] = map;
  }
  return this.data[id];
};

// return an element for the passed x,y position
Map.prototype.get = function(x, y) {
  var id = mapId(x, y);
  return this.data[id];
};

/**
 * a wrapper for a single cell; created by the Grid.
 */
var Cell = function(grid, index) {
  if (!grid) {
    throw new Error("invalid grid");
  }
  this._grid = grid;
  this._index = index;
};
Cell.prototype.cellIndex = function() {
  return this._index;
};
Cell.prototype.cellPos = function() {
  return this._grid.layer.cellIndexToPos(this._index);
};
Cell.prototype.grid = function() {
  return this._grid;
};
Cell.prototype.tileId = function() {
  return this._grid.raw[this._index][0];
};
Cell.prototype.tileIndex = function() {
  return this._grid.raw[this._index][1];
};
Cell.prototype.tileRot = function() {
  return this._grid.raw[this._index][2];
};

/**
 * wraps the array of grid data; created by the Layer.
 */
var Grid = function(layer, gx, gy, raw) {
  if (!layer) {
    throw new Error("invalid layer");
  }
  this.layer = layer;
  this.ofs = pt(gx, gy);
  this.raw = raw;
};

// FIX: cleanup the location of layer.cellIndex, layer.cell
Grid.prototype.cellByPixel = function(pix) {
  var cell = this.layer.cellPos(pix);
  var index = this.layer.cellIndex(cell);
  return new Cell(this, index);
}

// FIX: cleanup the location of layer.cellIndex, layer.cell
Grid.prototype.cellByIndex = function(index) {
  return new Cell(this, index);
}


/**
 * A map of grids.
 * all grids in the layer have width*height pixels.
 */
var Layer = function(id, cells, pixels) {
  this.id = id;
  this.cells = cells; // number of cells wide,high
  this.pixels = pixels; // number of pixels wide,high
  this.cellSize = pt(pixels.x / cells.x, pixels.y / cells.y); // size in pixel of each cell
  this.grids = new Map();
};

// return grid based on position.
Layer.prototype.grid = function(pix) {
  var gx = Math.floor(pix.x / this.pixels.x);
  var gy = Math.floor(pix.y / this.pixels.y);
  var layer= this; // pin "this" for use in callback.
  return layer.grids.getOrCreate(gx, gy, function() {
    return new Grid(layer, gx, gy, []);
  });
};

// return cell x,y within a grid.
Layer.prototype.cellPos = function(pix) {
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
Layer.prototype.cellIndexToPos = function(cellIndex) {
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
        getBestLayer: function(pix) {
          var tileSize = mapService.getTileSize(pix);
          return layers.getOrCreate(tileSize.x, tileSize.y, function(id) {
            var pixels = pt(tileSize.x * cells.x, tileSize.y * cells.y);
            return new Layer(id, cells, pixels);
          });
        },

        // return array of json data
        mapData: function() {
          var rawMap = []; // an array of layers
          mapService.gridSizes.map(function(sz) {
            var layer = layers.get(sz.x, sz.y);
            if (layer) {
              var rawLayer = {
                x: layer.cellSize.x,
                y: layer.cellSize.y,
                grids: []
              };
              rawMap.push(rawLayer);
              var layerData= layer.grids.data;  // tricky :(
              for (var k in layerData) {
                var grid = layerData[k];
                var rawGrid = {
                  x: grid.ofs.x,
                  y: grid.ofs.y,
                  data: grid.raw
                };
                rawLayer.grids.push(rawGrid);
              }
            }
          });
          return rawMap;
        },

        // add the passed tile to the world at the passed pixel position with the passed rotation.
        place: function(tileId, tileIdx, pix, rot) {
          // create the data needed for the map.
          var data = [tileId, tileIdx, rot];
          // pick the best layer for this position.
          var layer = mapService.getBestLayer(pix);
          if (!layer) {
            throw new Error("couldnt find layer for" + pix);
          }
          // pick the floating grid within that layer.
          var grid = layer.grid(pix);
          if (!grid) {
            throw new Error("couldnt find grid for" + pix);
          }
          // find the cell index on that grid.
          var cell = grid.cellByPixel(pix);
          if (!cell) {
            throw new Error("couldnt find cell for" + pix);
          }
          // store the data; FIX: sure is nice and object oriented :(
          grid.raw[cell._index] = data;
          // let everyone known the map has changed.
          $rootScope.$broadcast('tilePlaced', cell);
          return cell;
        },
      };

      return mapService;
    });
