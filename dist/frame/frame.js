'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constants = require('../constants');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Frame = function () {
  function Frame(type, options) {
    var _this = this;

    _classCallCheck(this, Frame);

    this.stream_id = -1;
    this.flags = 0x0;
    this.payload = new Buffer(0);

    this.type = type;
    this.flags = _extends({}, _constants.FrameFlags[this.type]);
    if (this.flags && this.flags.keys) delete this.flags.keys;
    Object.entries(this.flags).forEach(function (entry) {
      _this.flags[entry[0]] = false;
    });
    if (!options) {
      return;
    }
    this.stream_id = typeof options.stream_id != 'undefined' ? options.stream_id : -1;
    Object.entries(this.flags).forEach(function (flag) {
      _this.flags[flag[0]] = (options.flags & _constants.FrameFlags[_this.type][flag[0]]) != 0;
    });
    if (options.payload) this.payload = Buffer.concat([new Buffer(0), options.payload]);else this.payload = new Buffer(0);
  }

  _createClass(Frame, [{
    key: 'set_data',
    value: function set_data(data) {
      this.payload = Buffer.concat([new Buffer(0), data]);
    }
  }, {
    key: 'append_data',
    value: function append_data(data) {
      this.payload = Buffer.concat([this.payload, data]);
    }
  }, {
    key: 'set_stream_id',
    value: function set_stream_id(id) {
      this.stream_id = id;
    }
  }, {
    key: 'get_payload',
    value: function get_payload() {
      return this.payload;
    }
  }]);

  return Frame;
}();

exports.default = Frame;