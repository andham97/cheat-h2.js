'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constants = require('../constants');

var _error = require('../error');

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _header = require('./header');

var _header2 = _interopRequireDefault(_header);

var _rst_stream = require('./rst_stream');

var _rst_stream2 = _interopRequireDefault(_rst_stream);

var _ping = require('./ping');

var _ping2 = _interopRequireDefault(_ping);

var _go_away = require('./go_away');

var _go_away2 = _interopRequireDefault(_go_away);

var _continuation = require('./continuation');

var _continuation2 = _interopRequireDefault(_continuation);

var _window_update = require('./window_update');

var _window_update2 = _interopRequireDefault(_window_update);

var _push_promise = require('./push_promise');

var _push_promise2 = _interopRequireDefault(_push_promise);

var _priority = require('./priority');

var _priority2 = _interopRequireDefault(_priority);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Parser = function () {
  function Parser() {
    _classCallCheck(this, Parser);
  }

  _createClass(Parser, [{
    key: 'decode',
    value: function decode(data) {
      if (data.length < 9) throw new _error.ConnectionError(_constants.ErrorCodes.PROTOCOL_ERROR, 'non-9 octet mandatory frame field');
      var length = data.readUIntBE(0, 3);
      var type = data.readUInt8(3);
      var flags = data.readUInt8(4);
      var stream_id = data.readUInt32BE(5) & 0x7fffffff;
      var payload = data.slice(9);
      if (payload.length != length) throw new _error.ConnectionError(_constants.ErrorCodes.PROTOCOL_ERROR, 'non-matching payload length. Header specified: ' + length + ', actual: ' + payload.length);
      var pref = {
        flags: flags,
        stream_id: stream_id,
        payload: payload
      };
      switch (type) {
        case _constants.FrameTypes.DATA:
          return new _data2.default(pref);

        case _constants.FrameTypes.HEADERS:
          return new _header2.default(pref);

        case _constants.FrameTypes.PRIORITY:
          return new _priority2.default(pref);

        case _constants.FrameTypes.RST_STREAM:
          return new _rst_stream2.default(pref);

        case _constants.FrameTypes.SETTINGS:
          return new _settings2.default(pref);

        case _constants.FrameTypes.PING:
          return new _ping2.default(pref);

        case _constants.FrameTypes.GOAWAY:
          return new _go_away2.default(pref);

        case _constants.FrameTypes.CONTINUATION:
          return new _continuation2.default(pref);

        case _constants.FrameTypes.WINDOW_UPDATE:
          return new _window_update2.default(pref);

        case _constants.FrameTypes.PUSH_PROMISE:
          return new _push_promise2.default(pref);
      }
      console.log();
      console.log('INVALID FRAME TYPE');
      console.log(_extends({}, pref, { type: type, length: length }));
    }
  }, {
    key: 'encode',
    value: function encode(frame) {
      var header = new Buffer(9);
      if (frame.stream_id >= Math.pow(2, 31) || Math.abs(frame.stream_id) != frame.stream_id) throw new _error.ConnectionError(_constants.ErrorCodes.INTERNAL_ERROR, 'non-zero stream id');
      if (frame.payload.length >= Math.pow(2, 24)) throw new _error.ConnectionError(_constants.ErrorCodes.INTERNAL_ERROR, 'frame payload exceed max size');
      var flag = 0x0;
      Object.entries(frame.flags).forEach(function (f) {
        if (!f[1]) return;
        flag |= _constants.FrameFlags[frame.type][f[0]];
      });
      var payload = frame.get_payload();
      header.writeUIntBE(payload.length, 0, 3);
      header.writeUIntBE(frame.type, 3, 1);
      header.writeUIntBE(flag, 4, 1);
      header.writeUIntBE(frame.stream_id, 5, 4);
      return Buffer.concat([header, payload]);
    }
  }]);

  return Parser;
}();

exports.default = Parser;