'use strict';

describe("MapService", function() {
  beforeEach(module('mosaic'));

  var MapService, $log, $rootScope;
  beforeEach(inject(function(_MapService_, _$log_, _$rootScope_) {
    MapService = _MapService_;
    $log = _$log_;
    $rootScope = _$rootScope_; // for digest/processing of promises
  }));

  it('should convert map coordinates back and forth', function() {
    // the point must be aligned to the grid 
    // otherwise we will get a tile size of 1.
    var pix = pt(64, 256);
    var tileSize = MapService.getTileSize(pix);
    expect(tileSize.x).toEqual(32);
    expect(tileSize.y).toEqual(32);

    //
    var layer = MapService.getLayer(pix);
    expect(layer.cells.x).toEqual(16);
    expect(layer.cells.y).toEqual(layer.cells.x);
    //
    expect(layer.pixels.x).toEqual(16 * 32); // 512
    expect(layer.pixels.y).toEqual(layer.pixels.x);

    // make sure getting the grids works
    var g = layer.grid(pix);
    expect(g).toBe(layer.grid(pix));
    var negpix = pt(-pt.x, -pt.y);
    expect(g).not.toBe(layer.grid(negpix));
    //
    var cell = layer.cell(pix);
    expect(cell.x).toEqual(2);
    expect(cell.y).toEqual(8);
    //
    var cellIndex= layer.cellIndex(cell);
    expect(cellIndex).toEqual(2+(16*8));
    //
    var pos= layer.cellPos(cellIndex);
    expect(pos).toEqual(pix); 
  });
});
