'use strict';

function newCanvas(id, w, h) {
  var el = angular.element('<canvas id="' + id + '"></canvas>');
  var canvas = el[0];
  canvas.width = w;
  canvas.height = h;
  return el;
}

var scratch = null;

// helper to access the sprite data.
var Sprite = function(tile, index) {
  this.tile = tile;
  this.index = index;
  var data = tile.attr['sprites'][index];
  var size = data['size'];
  this.x = data['x'];
  this.y = data['y'];
  this.width = size;
  this.height = size;
  this._image = null;
};

// cache a new image source containing the pixel data for this sprite.
Sprite.prototype.image = function() {
  if (!this._image) {
    var img = new Image();
    img.src = this.tile.attr['src'];
    this._image = img;
  }
  return this._image;
};

// clear a region at the passed pos of the size of this sprite
Sprite.prototype.clearAt = function(ctx, pos) {
  ctx.clearRect(pos.x, pos.y, this.width, this.height);
};

Sprite.prototype.drawAt = function(ctx, pos, rot) {
  // use a temporary canvas to handle the pain of destination-only rotation.
  if (!scratch) {
    scratch = newCanvas("scratch", this.width, this.height)[0];
  } else {
    scratch.width = this.width;
    scratch.height = this.height;
  }
  // fill it with our rotated data.
  this.fillCanvas(scratch, rot);
  // then draw from the scratch buffer to the output canvas
  ctx.drawImage(scratch, pos.x, pos.y);
};

// fill the passed canvas with this sprite, rotating it as we go.
Sprite.prototype.fillCanvas = function(canvas, rot) {
  var ctx = canvas.getContext("2d");
  var wx = 0.5 * canvas.width;
  var wy = 0.5 * canvas.height;
  ctx.translate(wx, wy);
  ctx.rotate(0.5 * (rot || 0) * Math.PI);
  var x = this.x * this.width;
  var y = this.y * this.height;
  var img = this.image();
  ctx.clearRect(-wx, -wy, this.width, this.height);
  ctx.drawImage(img,
    x, y, this.width, this.height, -wx, -wy, this.width, this.height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

// create a new canvas (element) filling it with the image of this sprite.
Sprite.prototype.newCanvas = function(id) {
  return newCanvas(id, this.width, this.height);
};

/**
 * @fileoverview TileService
 */
angular.module('mosaic')
  .factory('TileService',
    function(JsonService, $http, $log, $q) {
      var tileService = {
        // return a promise of tile data.
        getTiles: function() {
          var deferred = $q.defer();
          //
          $http.get('tiles').then(function(resp) {
            var tiles = {};
            JsonService.parseMultiDoc(resp.data, "getTileList",
              function(obj) {
                tiles[obj.id] = obj;
              });
            // parse this tile list into something more locally useful?
            deferred.resolve(tiles);
          }, deferred.reject);
          //
          return deferred.promise;
        },

        // return a sprite for the indexed tile.
        getSprite: function(tile, index) {
          var sprite = new Sprite(tile, index);
          return sprite;
        },

        // promise a sprite for the indexed tileId.
        getSpriteById: function(tileId, index) {
          var deferred = $q.defer();
          tileService.getTiles().then(function(tiles) {
            var tile = tiles[tileId]
            var sprite = new Sprite(tile, index);
            deferred.resolve(sprite);
          }, deferred.reject);
          return deferred.promise;
        },
      };
      return tileService;
    });
