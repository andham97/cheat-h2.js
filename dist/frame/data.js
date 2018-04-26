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

var DataFrame = function (_Frame) {
  _inherits(DataFrame, _Frame);

  function DataFrame(options) {
    _classCallCheck(this, DataFrame);

    var _this = _possibleConstructorReturn(this, (DataFrame.__proto__ || Object.getPrototypeOf(DataFrame)).call(this, _constants.FrameTypes.DATA, options));

    if (!options) return _possibleConstructorReturn(_this);
    if (_this.flags.PADDED) {
      if (_this.payload < 1) {
        throw new _error.ConnectionError(_constants.ErrorCodes.FRAME_SIZE_ERROR, 'missing bytes for padding control');
      }
      var padding_length = _this.payload.readUInt8(0);
      _this.data = _this.payload.slice(1, _this.payload.length - padding_length);
      var padding = _this.payload.slice(_this.payload.length - padding_length);
      if (Buffer.compare(padding, new Buffer(padding.length))) throw new _error.ConnectionError(_constants.ErrorCodes.PROTOCOL_ERROR, 'non-zero padding bytes');
    }
    if (_this.padding >= _this.payload.length - 1) throw new _error.ConnectionError(_constants.ErrorCodes.FRAME_SIZE_ERROR, 'payload is all padding or padding is set to be greater than entire payload');
    return _this;
  }

  _createClass(DataFrame, [{
    key: 'get_payload',
    value: function get_payload() {
      return _get(DataFrame.prototype.__proto__ || Object.getPrototypeOf(DataFrame.prototype), 'get_payload', this).call(this);
    }
  }]);

  return DataFrame;
}(_frame2.default);

exports.default = DataFrame;