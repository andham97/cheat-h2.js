'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _istream = require('./istream');

var _istream2 = _interopRequireDefault(_istream);

var _constants = require('../constants');

var _error = require('../error');

var _settings = require('../frame/settings');

var _settings2 = _interopRequireDefault(_settings);

var _ping = require('../frame/ping');

var _ping2 = _interopRequireDefault(_ping);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ControlStream = function (_IStream) {
  _inherits(ControlStream, _IStream);

  function ControlStream(id, session) {
    _classCallCheck(this, ControlStream);

    return _possibleConstructorReturn(this, (ControlStream.__proto__ || Object.getPrototypeOf(ControlStream)).call(this, id, session));
  }

  _createClass(ControlStream, [{
    key: 'recieve_frame',
    value: function recieve_frame(frame) {
      console.log();
      console.log('Control Stream ID: ' + this.stream_id);
      console.log('Frame type: ' + _constants.FrameTypes.keys[frame.type]);
      console.log(frame);
      switch (frame.type) {
        case _constants.FrameTypes.SETTINGS:
          if (frame.flags.ACK) return;
          var ack_settings_frame = new _settings2.default();
          ack_settings_frame.stream_id = 0;
          ack_settings_frame.flags.ACK = true;
          this.session.transmit_frame(ack_settings_frame);
          this.session.in_settings.update_settings(frame);
          this.session.in_context.set_max_table_size(this.session.in_settings.settings.SETTINGS_HEADER_TABLE_SIZE);
          break;
        case _constants.FrameTypes.WINDOW_UPDATE:
          this.session.flow_control.outgoing = frame.window_size;
          break;
        case _constants.FrameTypes.GOAWAY:
          console.log(frame.debug_data.toString());
          this.session.socket.destroy();
          break;
        case _constants.FrameTypes.PING:
          var ack_ping_frame = new _ping2.default();
          ack_ping_frame.flags.ACK = true;
          ack_ping_frame.payload = frame.payload;
          ack_ping_frame.stream_id = 0;
          this.session.transmit_frame(ack_ping_frame);
          break;
        default:
          throw new _error.ConnectionError(_constants.ErrorCodes.PROTOCOL_ERROR, 'invalid frame recieved: ' + _constants.FrameTypes.keys[frame.type], this.stream_id);
      }
    }
  }]);

  return ControlStream;
}(_istream2.default);

exports.default = ControlStream;