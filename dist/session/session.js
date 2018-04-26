'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _frame = require('../frame/frame');

var _frame2 = _interopRequireDefault(_frame);

var _settings = require('../frame/settings');

var _settings2 = _interopRequireDefault(_settings);

var _window_update = require('../frame/window_update');

var _window_update2 = _interopRequireDefault(_window_update);

var _data = require('../frame/data');

var _data2 = _interopRequireDefault(_data);

var _go_away = require('../frame/go_away');

var _go_away2 = _interopRequireDefault(_go_away);

var _rst_stream = require('../frame/rst_stream');

var _rst_stream2 = _interopRequireDefault(_rst_stream);

var _push_promise = require('../frame/push_promise');

var _push_promise2 = _interopRequireDefault(_push_promise);

var _settings3 = require('./settings');

var _settings4 = _interopRequireDefault(_settings3);

var _parser = require('../frame/parser');

var _parser2 = _interopRequireDefault(_parser);

var _istream = require('./istream');

var _istream2 = _interopRequireDefault(_istream);

var _ostream = require('./ostream');

var _ostream2 = _interopRequireDefault(_ostream);

var _cstream = require('./cstream');

var _cstream2 = _interopRequireDefault(_cstream);

var _constants = require('../constants');

var _error2 = require('../error');

var _hpack = require('../hpack');

var _hpack2 = _interopRequireDefault(_hpack);

var _flow_control = require('./flow_control');

var _flow_control2 = _interopRequireDefault(_flow_control);

var _priority = require('./priority');

var _priority2 = _interopRequireDefault(_priority);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var init_buffer = new Buffer('PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n', 'binary');
var init_settings = function () {
  var settings = new _settings4.default();
  settings.set_setting(_constants.SettingsEntries.SETTINGS_MAX_CONCURRENT_STREAMS, 20);
  return settings.to_frame(0);
}();
var init_window_update = new _window_update2.default();
init_window_update.stream_id = 0;
init_window_update.window_size = 0xffff;

var Session = function (_EventEmitter) {
  _inherits(Session, _EventEmitter);

  function Session(sock, id, mgr) {
    _classCallCheck(this, Session);

    var _this = _possibleConstructorReturn(this, (Session.__proto__ || Object.getPrototypeOf(Session)).call(this));

    _this.is_init = false;
    _this.open = true;
    _this.streams = {};
    _this.active_in_streams = 0;
    _this.active_out_streams = 0;
    _this.headers = {};
    _this.next_ostream_id = 2;

    _this.socket = sock;
    _this.session_id = id;
    _this.manager = mgr;
    _this.parser = new _parser2.default(_this);
    _this.in_settings = new _settings4.default();
    _this.out_settings = new _settings4.default();
    _this.out_settings.update_settings(init_settings);
    _this.in_context = new _hpack2.default();
    _this.out_context = new _hpack2.default();
    _this.flow_control = new _flow_control2.default();
    _this.priority = new _priority2.default();

    _this.socket.on('data', function (data) {
      if (!_this.is_init && Buffer.compare(data.slice(0, 24), init_buffer) == 0) {
        _this.transmit_frame(init_settings);
        _this.transmit_frame(init_window_update);
        _this.is_init = true;
        if (data.length == 24) return;
        data = data.slice(24);
      }
      if (!_this.is_init) return _this.socket.destroy();
      try {
        _this.process_frame(data);
      } catch (error) {
        _this.error(error);
      }
    });
    _this.socket.on('error', function (error) {
      _this.error(error);
    });

    _this.socket.on('close', function () {
      _this.manager.session_close(_this);
    });
    return _this;
  }

  _createClass(Session, [{
    key: 'update_headers',
    value: function update_headers(headers) {
      for (var i = 0; i < headers.length; i++) {
        this.headers[headers[i].name] = headers[i].value;
      }
    }
  }, {
    key: 'process_frame',
    value: function process_frame(data) {
      var frame = this.parser.decode(data);
      if (!(frame instanceof _frame2.default)) return;
      if (frame instanceof _data2.default && !this.flow_control.recieve(frame.payload)) throw new _error2.ConnectionError(_constants.ErrorCodes.FLOW_CONTROL_ERROR, 'recieving flow-control bounds exceeded');
      this.delegate_frame(frame);
    }
  }, {
    key: 'delegate_frame',
    value: function delegate_frame(frame) {
      for (var i = frame.stream_id - 2; i > 0; i -= 2) {
        if (this.streams[i].stream_state == _constants.StreamState.STREAM_IDLE) this.streams[i].emit('transition_state', _constants.StreamState.STREAM_CLOSED);
      }
      var stream = this.streams[frame.stream_id];
      if (stream) stream.recieve_frame(frame);else {
        if (frame.stream_id == 0) stream = new _cstream2.default(frame.stream_id, this);else stream = new _istream2.default(frame.stream_id, this);
        this.streams[frame.stream_id] = stream;
        if (stream.stream_id != 0) this.priority.add_stream(stream);
        stream.recieve_frame(frame);
      }
      this.priority.get_next_streams().forEach(function (stream) {
        if (stream.stream_state == _constants.StreamState.STREAM_HALF_CLOSED_REMOTE) stream.handle_request();
      });
    }
  }, {
    key: 'send_frame_istream',
    value: function send_frame_istream(frame) {
      if (frame.stream_id % 2 == 0 && frame.stream_id != 0) {
        var stream = this.streams[frame.stream_id];
        if (stream) return stream.recieve_frame(frame);else {
          stream = new _ostream2.default(frame.stream_id, this);
          this.streams[frame.stream_id] = stream;
          return stream.recieve_frame(frame);
        }
      } else {
        if (frame instanceof _push_promise2.default) {
          var _stream = this.streams[frame.promised_id];
          if (_stream) _stream.stream_state = _constants.StreamState.STREAM_RESERVED_LOCAL;else {
            _stream = new _ostream2.default(frame.promised_id, this);
            this.streams[frame.stream_id] = _stream;
            _stream.stream_state = _constants.StreamState.STREAM_RESERVED_LOCAL;
          }
        }
        this.transmit_frame(frame);
      }
    }
  }, {
    key: 'send_frame_ostream',
    value: function send_frame_ostream(frame) {
      this.transmit_frame(frame);
    }
  }, {
    key: 'transmit_frame',
    value: function transmit_frame(frame) {
      var _this2 = this;

      console.log();
      console.log('SENDING');
      console.log(frame);
      if (frame.debug_data) console.log(frame.debug_data.toString());
      if (frame instanceof _data2.default && !this.flow_control.send(frame.payload)) throw new _error2.ConnectionError(_constants.ErrorCodes.FLOW_CONTROL_ERROR, 'recieving flow-control bounds exceeded');
      this.socket.write(this.parser.encode(frame), function () {
        if (frame instanceof _go_away2.default) {
          console.log('DESTROING SOCKET');
          _this2.socket.destroy();
        }
      });
    }
  }, {
    key: 'error',
    value: function error(_error) {
      console.log();
      console.log(_constants.ErrorCodes.keys[_error.error_code]);
      console.log(_error);
      if (_error.type == 0x1) {
        var error_frame = new _go_away2.default();
        error_frame.last_stream_id = Math.max(_error.stream_id - 2, 0);
        error_frame.stream_id = 0;
        error_frame.error_code = _error.error_code;
        error_frame.debug_data = new Buffer(_error.message, 'utf-8');
        this.transmit_frame(error_frame);
      } else if (_error.type == 0x2) {
        var _error_frame = new _rst_stream2.default();
        _error_frame.stream_id = _error.stream_id;
        _error_frame.error_code = _error.error_code;
        this.transmit_frame(_error_frame);
      } else {
        console.log('UNDEFINED ERROR TYPE: ' + _error.constructor.name);
      }
    }
  }]);

  return Session;
}(_events2.default);

exports.default = Session;