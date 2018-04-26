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

var GoawayFrame = function (_Frame) {
  _inherits(GoawayFrame, _Frame);

  function GoawayFrame(options) {
    _classCallCheck(this, GoawayFrame);

    var _this = _possibleConstructorReturn(this, (GoawayFrame.__proto__ || Object.getPrototypeOf(GoawayFrame)).call(this, _constants.FrameTypes.GOAWAY, options));

    if (!options) return _possibleConstructorReturn(_this);
    if (_this.stream_id != 0) throw new _error.ConnectionError(_constants.ErrorCodes.PROTOCOL_ERROR, 'non-zero stream id');
    _this.last_stream_id = _this.payload.readUInt32BE(0) & 0x7fffffff;
    _this.error_code = _this.payload.readUInt32BE(1);
    _this.debug_data = _this.payload.slice(8);
    return _this;
  }

  _createClass(GoawayFrame, [{
    key: 'get_payload',
    value: function get_payload() {
      this.payload = Buffer.concat([new Buffer([this.last_stream_id >> 24 & 0x7f, this.last_stream_id >> 16, this.last_stream_id >> 8, this.last_stream_id, this.error_code >> 24, this.error_code >> 16, this.error_code >> 8, this.error_code]), this.debug_data]);
      if (this.payload.length < 8) throw new _error.ConnectionError(_constants.ErrorCodes.INTERNAL_ERROR, 'too small frame');
      if (!_constants.ErrorCodes.keys[this.error_code]) throw new _error.ConnectionError(_constants.ErrorCodes.INTERNAL_ERROR, 'unknown error type');
      return _get(GoawayFrame.prototype.__proto__ || Object.getPrototypeOf(GoawayFrame.prototype), 'get_payload', this).call(this);
    }
  }]);

  return GoawayFrame;
}(_frame2.default);

exports.default = GoawayFrame;