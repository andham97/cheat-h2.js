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

var RSTStreamFrame = function (_Frame) {
  _inherits(RSTStreamFrame, _Frame);

  function RSTStreamFrame(options) {
    _classCallCheck(this, RSTStreamFrame);

    var _this = _possibleConstructorReturn(this, (RSTStreamFrame.__proto__ || Object.getPrototypeOf(RSTStreamFrame)).call(this, _constants.FrameTypes.RST_STREAM, options));

    if (!options) return _possibleConstructorReturn(_this);
    if (_this.stream_id == 0) throw new _error.ConnectionError(_constants.ErrorCodes.PROTOCOL_ERROR, 'stream id = 0');
    if (_this.payload.length != 4) throw new _error.ConnectionError(_constants.ErrorCodes.FRAME_SIZE_ERROR, 'non-4 octet frame size');
    if (!_constants.ErrorCodes.keys[_this.payload.readUInt32BE(0)]) throw new _error.ConnectionError(_constants.ErrorCodes.INTERNAL_ERROR, 'unknown error code');
    return _this;
  }

  _createClass(RSTStreamFrame, [{
    key: 'get_payload',
    value: function get_payload() {
      if (this.stream_id == 0) throw new _error.ConnectionError(_constants.ErrorCodes.PROTOCOL_ERROR, 'stream id = 0');
      this.payload = new Buffer([this.error_code >> 24, this.error_code >> 16, this.error_code >> 8, this.error_code]);
      return _get(RSTStreamFrame.prototype.__proto__ || Object.getPrototypeOf(RSTStreamFrame.prototype), 'get_payload', this).call(this);
    }
  }]);

  return RSTStreamFrame;
}(_frame2.default);

exports.default = RSTStreamFrame;