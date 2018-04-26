'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constants = require('../constants');

var _settings = require('../frame/settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var init_values = {
  SETTINGS_HEADER_TABLE_SIZE: 0x1000,
  SETTINGS_ENABLE_PUSH: true,
  SETTINGS_MAX_CONCURRENT_STREAMS: -1,
  SETTINGS_INITIAL_WINDOW_SIZE: 0xffff,
  SETTINGS_MAX_FRAME_SIZE: 0x4000,
  SETTINGS_MAX_HEADER_LIST_SIZE: -1
};

var Settings = function () {
  function Settings() {
    _classCallCheck(this, Settings);

    this.settings = _extends({}, init_values);
  }

  _createClass(Settings, [{
    key: 'set_setting',
    value: function set_setting(code, value) {
      if (code == 'keys') return;
      if (_constants.SettingsEntries[code] != undefined) this.settings[code] = value;else if (_constants.SettingsEntries.keys[code] != undefined) this.settings[_constants.SettingsEntries.keys[code]] = value;
    }
  }, {
    key: 'update_settings',
    value: function update_settings(frame) {
      if (!(frame instanceof _settings2.default)) return;
      Object.entries(frame.settings).forEach(function (setting) {});
    }
  }, {
    key: 'to_frame',
    value: function to_frame(stream_id) {
      if (stream_id == undefined || typeof stream_id !== 'number') return null;
      var settings_frame = new _settings2.default();
      settings_frame.stream_id = stream_id;
      Object.entries(this.settings).forEach(function (setting) {
        if (init_values[setting[0]] != undefined && init_values[setting[0]] != setting[1]) settings_frame.settings[setting[0]] = setting[1];
      });
      return settings_frame;
    }
  }]);

  return Settings;
}();

exports.default = Settings;