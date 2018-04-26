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

var WindowUpdateFrame = function (_Frame) {
  _inherits(WindowUpdateFrame, _Frame);

  function WindowUpdateFrame(options) {
    _classCallCheck(this, WindowUpdateFrame);

    var _this = _possibleConstructorReturn(this, (WindowUpdateFrame.__proto__ || Object.getPrototypeOf(WindowUpdateFrame)).call(this, _constants.FrameTypes.WINDOW_UPDATE, options));

    if (!options) return _possibleConstructorReturn(_this);
    if (_this.payload.length != 4) {
      throw new _error.ConnectionError(_constants.ErrorCodes.FRAME_SIZE_ERROR, 'non-4 octet payload size');
      _this.window_size = _this.payload.readUInt32BE(0) ^ 0x80000000;
    }
    return _this;
  }

  _createClass(WindowUpdateFrame, [{
    key: 'get_payload',
    value: function get_payload() {
      this.payload = new Buffer([this.window_size >> 24, this.window_size >> 16, this.window_size >> 8, this.window_size]);
      if (this.payload.readUInt32BE(0) > Math.pow(2, 31) - 1) throw new _error.ConnectionError(_constants.ErrorCodes.INTERNAL_ERROR, 'size error');
      return _get(WindowUpdateFrame.prototype.__proto__ || Object.getPrototypeOf(WindowUpdateFrame.prototype), 'get_payload', this).call(this);
    }
  }]);

  return WindowUpdateFrame;
}(_frame2.default);

exports.default = WindowUpdateFrame;