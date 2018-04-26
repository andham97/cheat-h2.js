'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _constants = require('../constants');

var _error = require('../error');

var _frame = require('./frame');

var _frame2 = _interopRequireDefault(_frame);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HeadersFrame = function (_Frame) {
  _inherits(HeadersFrame, _Frame);

  function HeadersFrame(options) {
    _classCallCheck(this, HeadersFrame);

    var _this = _possibleConstructorReturn(this, (HeadersFrame.__proto__ || Object.getPrototypeOf(HeadersFrame)).call(this, _constants.FrameTypes.HEADERS, options));

    _this.headers = {};

    if (!options) return _possibleConstructorReturn(_this);
    if (_this.stream_id == 0) throw new _error.ConnectionError(_constants.ErrorCodes.PROTOCOL_ERROR, 'non-zero stream id');
    if (_this.flags.PADDED) {
      var padding_length = _this.payload.readUInt8(0);
      if (Buffer.compare(new Buffer(padding_length), _this.payload.slice(_this.payload.length - padding_length)) != 0) throw new _error.ConnectionError(_constants.ErrorCodes.PROTOCOL_ERROR, 'non-zero padding bytes');
      _this.payload = _this.payload.slice(1, _this.payload.length - padding_length);
    }
    if (_this.flags.PRIORITY) {
      _this.exclusive = (_this.payload.readUInt32BE(0) & 0x1 << 31) != 0;
      _this.weight = _this.payload.readUInt8(4);
      _this.stream_dependency = _this.payload.readUInt32BE(0) & 0x7fffffff;
      _this.payload = _this.payload.slice(5);
    }
    return _this;
  }

  _createClass(HeadersFrame, [{
    key: 'get_payload',
    value: function get_payload() {
      if (this.flags.PRIORITY) {
        var stream_dependency = this.stream_dependency;
        if (stream_dependency < Math.pow(2, 31)) if (this.exclusive) stream_dependency |= 0x80000000;
        if (this.weight > 256) throw new _error.ConnectionError(_constants.ErrorCodes.FRAME_SIZE_ERROR, 'weight extends 256');
        this.payload = Buffer.concat(new Buffer([stream_dependency >> 24, stream_dependency >> 16, stream_dependency >> 8, stream_dependency, this.weight]), this.payload);
      }
      if (this.flags.PADDED) {
        if (!this.padding) {
          throw new _error.ConnectionError(_constants.ErrorCodes.FRAME_SIZE_ERROR, 'padding missing');
        }
        this.payload = Buffer.concat(new Buffer([padding.length]), this.payload, this.padding);
      }
      return _get(HeadersFrame.prototype.__proto__ || Object.getPrototypeOf(HeadersFrame.prototype), 'get_payload', this).call(this);
    }
  }]);

  return HeadersFrame;
}(_frame2.default);

exports.default = HeadersFrame;