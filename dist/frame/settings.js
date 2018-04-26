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

var SettingsFrame = function (_Frame) {
  _inherits(SettingsFrame, _Frame);

  function SettingsFrame(options) {
    _classCallCheck(this, SettingsFrame);

    var _this = _possibleConstructorReturn(this, (SettingsFrame.__proto__ || Object.getPrototypeOf(SettingsFrame)).call(this, _constants.FrameTypes.SETTINGS, options));

    _this.settings = {};

    if (!options) return _possibleConstructorReturn(_this);
    if (_this.stream_id != 0) throw new _error.ConnectionError(_constants.ErrorCodes.PROTOCOL_ERROR, 'non-zero stream id');
    if (_this.payload.length % 6 != 0) throw new _error.ConnectionError(_constants.ErrorCodes.FRAME_SIZE_ERROR, 'non-6 octet frame size');
    if (_this.flags.ACK && _this.payload.length != 0) throw new _error.ConnectionError(_constants.ErrorCodes.FRAME_SIZE_ERROR, '32-bit value not zero');
    for (var i = 0; i < _this.payload.length; i += 6) {
      _this.settings[_constants.SettingsEntries.keys[_this.payload.readUIntBE(i, 2)]] = _this.payload.readUIntBE(i + 2, 4);
    }
    return _this;
  }

  _createClass(SettingsFrame, [{
    key: 'set_setting',
    value: function set_setting(setting, value) {
      this.settings[_constants.SettingsEntries.keys[setting]] = value;
    }
  }, {
    key: 'get_payload',
    value: function get_payload() {
      var _this2 = this;

      if (!this.flags.ACK) {
        var entries = Object.entries(this.settings);
        if (entries.length > 0) {
          this.payload = new Buffer(6 * entries.length);
          entries.forEach(function (setting, i) {
            _this2.payload.writeUIntBE(_constants.SettingsEntries[setting[0]], i * 6, 2);
            _this2.payload.writeUIntBE(typeof setting[1] == 'boolean' ? setting[1] ? 1 : 0 : setting[1], i * 6 + 2, 4);
          });
        }
      } else this.payload = new Buffer(0);
      return _get(SettingsFrame.prototype.__proto__ || Object.getPrototypeOf(SettingsFrame.prototype), 'get_payload', this).call(this);
    }
  }]);

  return SettingsFrame;
}(_frame2.default);

exports.default = SettingsFrame;