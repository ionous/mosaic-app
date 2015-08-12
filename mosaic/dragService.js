'use strict';


/**
 * @fileoverview DragService
 * sprite for tiles.
 * note: drag and drop is too annoying, this uses normal mouse events instead.
 */
angular.module('mosaic')
  .factory('DragService',
    function(TileService, $log, $rootElement, $rootScope, $window) {
      // internal list of all users of the drag service.
      var subscribers = {};

      var dragService = {
        // sprite or false
        sprite: false,

        subscribe: function(start, move, stop) {
          var index = 1 + Object.keys(subscribers).length;
          var s = {
            start: start,
            move: move,
            stop: stop
          };
          subscribers[index] = s;
          return index;
        },

        // appends #dragCanvas to the root element
        startDrag: function(evt, tile, index) {
          $log.info("start drag");

          // allow a select rectangle
          // ( might be nice with some sort of event? )
          var sprite = TileService.getSprite(tile, index);
          var dragCanvas = sprite.newCanvas("dragCanvas");
          var dragPos = {
            x: 0,
            y: 0,
            rot: 0
          };
          var lastPos = {
            x: 0,
            y: 0,
            rot: -1,
          };

          // on window update, notify the callers that drag has occured.
          var canceller = 0;
          var tick = function() {
            if (dragPos !== lastPos) {
              var d = dragCanvas[0];
              d.style.left = dragPos.x + 'px';
              d.style.top = dragPos.y + 'px';
              //d.style.transform ='rotate(' + dragPos.rot*90 + 'deg)';
              if (dragPos.rot != lastPos.rot) {
                sprite.fillCanvas(d, dragPos.rot);
              }

              for (var key in subscribers) {
                subscribers[key].move(dragPos, d);
              }

              lastPos = {
                x: dragPos.x,
                y: dragPos.y,
                rot: dragPos.rot
              };
            }
            canceller = $window.requestAnimationFrame(tick);
          };

          // stop sprite, cleanup.
          var onUp = function() {
            $log.info("drag done");
            for (var key in subscribers) {
              subscribers[key].stop();
            }
            $rootElement.off("mouseup", onUp);
            $rootElement.off("mousemove", onMove);
            $rootElement.off("keypress", onKey);
            dragCanvas.remove();
            dragService.sprite = false;
            $window.cancelAnimationFrame(canceller);
          };

          // update the drag position
          var onMove = function(evt) {
            dragPos.x = evt.clientX - $rootElement[0].offsetLeft
            dragPos.y = evt.clientY - $rootElement[0].offsetTop;
          };

          var onKey = function(evt) {
            // left = 37,up = 38, right = 39, down = 40
            // but they dont seem to work on "keypress"
            var rot = 0;
            var ch = String.fromCharCode(evt.which).toLowerCase();
            switch (ch) {
              case "q":
                rot = -1;
                break;
              case "w":
                rot = 1;
                break;
            };
            if (rot != 0) {
              var r = (dragPos.rot + rot) % 4;
              dragPos.rot = r < 0 ? r + 4 : r;
            }
          };

          // do the drag...
          $rootElement.on("mouseup", onUp);
          $rootElement.on("mousemove", onMove);
          $rootElement.on("keypress", onKey);
          $rootScope.currentTile = sprite;
          $rootElement.append(dragCanvas);
          dragService.sprite = sprite;

          for (var key in subscribers) {
            subscribers[key].start(tile, index);
          }
          // setup first position
          onMove(evt);
          tick();
        },
      }; // dragService
      return dragService;
    }); // factory
