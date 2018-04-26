'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flagToString = exports.typeToString = undefined;

var _frame = require('./frame');

var typeToString = exports.typeToString = function typeToString(type) {
  var t = Object.entries(_frame.FrameTypes).filter(function (pair) {
    return pair[1] == type;
  })[0];
  return t ? t[0] : t;
};

var flagToString = exports.flagToString = function flagToString(flag, type) {
  var t = Object.entries(_frame.FrameFlags[type]).filter(function (pair) {
    return pair[1] == flag;
  })[0];
  return t ? t[0] : t;
};