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
    var pix = pt(64, 256);
    var size = pt(32, 32);
    var layer = MapService.getBestLayer(size);
    expect(layer.numCells.x).toEqual(16);
    expect(layer.numCells.y).toEqual(layer.numCells.x);
    // make sure getting the grids works
    var g = layer.grid(pix);
    expect(g).toBe(layer.grid(pix));
    var negpix = pt(-pt.x, -pt.y);
    expect(g).not.toBe(layer.grid(negpix));
    //
    var cell = layer.cellByPixel(pix);
    var cellOfs= cell.cellOffset();
    expect(cellOfs.x).toEqual(2);
    expect(cellOfs.y).toEqual(8);
    //
    var cellIndex = cell.cellIndex();
    expect(cellIndex).toEqual(2 + (16 * 8));
    //
    var cellPos= cell.cellPos();
    expect(cellPos).toEqual(pix);
  });

  it('should record and output data', function() {
    var pix = pt(32, 32);
    var size = pt(32, 32);
    //
    var layer = MapService.getBestLayer(size);
    expect(layer).not.toBeUndefined();

    var cell = layer.place(pix, ["test", 123, 0]);
    expect(cell).not.toBeUndefined();
    //
    expect(cell.tileRot()).toEqual(0);
    expect(cell.tileIndex()).toEqual(123);
    expect(cell.tileId()).toEqual("test");
    //
    var mapData = MapService.mapData();
    // make sure that it really is json friendly data:
    var json = angular.toJson(mapData);
    var data = angular.fromJson(json);
    //
    expect(data.length).toEqual(1);
    var layer = data[0];
    // should have used the 32x32 grid
    expect(layer.x).toEqual(32);
    expect(layer.y).toEqual(layer.x);
    expect(layer.grids.length).toEqual(1);
    //
    var grid = layer.grids[0];
    expect(grid.x).toEqual(0);
    expect(grid.y).toEqual(0);
    // the 32x32 position on the 32x32 grid means the 1x1 cell
    var outx = 1;
    var outy = 1;
    // current expecting 16 wide grids:
    var el = grid.data[outy * 16 + outx];
    // so that's where we should find our placed data:
    expect(el).toEqual(['test', 123, 0]);
  });
});
