'use strict';

var _parser = require('./parser');

var Parser = _interopRequireWildcard(_parser);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var dataBuff = new Buffer([0x00, 0x00, 0x0d, 0x00, 0x09, 0x00, 0x00, 0x00, 0x01, 0x01, 0x4f, 0x64, 0x61, 0x20, 0x65, 0x72, 0x20, 0x6b, 0x75, 0x6c, 0x21, 0x00]);
var settingBuff = new Buffer([]);

var handlers = void 0;

var gen = function gen(req, res, handlers, i) {
  if (i === undefined) i = 0;
  if (!handlers || handler.length == 0) return function () {};
  return function () {
    if (i < handlers.length - 1) handlers[i](req, res, gen(req, res, handlers, i + 1));else handlers[i](req, res, function () {});
  };
};
gen(null, null, handlers)();