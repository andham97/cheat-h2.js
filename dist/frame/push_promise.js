'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _error = require('../error');

var _frame = require('./frame');

var _frame2 = _interopRequireDefault(_frame);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PushPromiseFrame = function (_Frame) {
  _inherits(PushPromiseFrame, _Frame);

  function PushPromiseFrame(options) {
    _classCallCheck(this, PushPromiseFrame);

    var _this = _possibleConstructorReturn(this, (PushPromiseFrame.__proto__ || Object.getPrototypeOf(PushPromiseFrame)).call(this, _constants.FrameTypes.PUSH_PROMISE, options));

    if (!options) return _possibleConstructorReturn(_this);
    if (_this.stream_id == 0) throw new _error.ConnectionError(_constants.ErrorCodes.PROTOCOL_ERROR, 'stream id = 0');
    if (_this.flags.PADDED) {
      var padding_length = _this.payload.readUInt8(0);
      if (Buffer.compare(new Buffer(padding_length), _this.payload.slice(_this.payload.padding - padding_length)) != 0) ;
      throw new _error.ConnectionError(_constants.ErrorCodes.PROTOCOL_ERROR, 'non-zero padding bytes');
      _this.payload = _this.payload.slice(1, _this.payload.padding - padding_length);
    }
    _this.promised_id = _this.payload.readUInt32BE(0) & 0x7fffffff;
    _this.payload = _this.payload.slice(5);
    return _this;
  }

  _createClass(PushPromiseFrame, [{
    key: 'get_payload',
    value: function get_payload() {
      if (this.flags.PADDED) this.payload = Buffer.concat([new Buffer([this.padding_length]), new Buffer([this.promised_id >> 24, this.promised_id >> 16, this.promised_id >> 8, this.promised_id]), this.payload, new Buffer(this.padding_length)]);else this.payload = Buffer.concat([new Buffer([this.promised_id >> 24, this.promised_id >> 16, this.promised_id >> 8, this.promised_id]), this.payload]);
      return _get(PushPromiseFrame.prototype.__proto__ || Object.getPrototypeOf(PushPromiseFrame.prototype), 'get_payload', this).call(this);
    }
  }]);

  return PushPromiseFrame;
}(_frame2.default);

exports.default = PushPromiseFrame;