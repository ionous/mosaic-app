'use strict';

/**
 * @constructor
 * @struct
 */
function pt(x, y) {
  return {
    x: x,
    y: y || x
  };
}

function pt_divFloor(ptn, ptd) {
  return pt(Math.floor(ptn.x / ptd.x), Math.floor(ptn.y / ptd.y));
}

function pt_add(a, b) {
  return pt(a.x + b.x, a.y + b.y);
}

function pt_mul(a, b) {
  return pt(a.x * b.x, a.y * b.y);
}

function pt_mod(a, b) {
  return pt(a.x % b.x, a.y % b.y);
}

function pt_eq(a, b) {
  return a.x === b.x && a.y === b.y;
}
