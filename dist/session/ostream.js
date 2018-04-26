'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stream = require('./stream');

var _stream2 = _interopRequireDefault(_stream);

var _constants = require('../constants');

var _hpack = require('../hpack');

var _request = require('./request');

var _request2 = _interopRequireDefault(_request);

var _response = require('./response');

var _response2 = _interopRequireDefault(_response);

var _header = require('../frame/header');

var _header2 = _interopRequireDefault(_header);

var _data = require('../frame/data');

var _data2 = _interopRequireDefault(_data);

var _push_promise = require('../frame/push_promise');

var _push_promise2 = _interopRequireDefault(_push_promise);

var _rst_stream = require('../frame/rst_stream');

var _rst_stream2 = _interopRequireDefault(_rst_stream);

var _error = require('../error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OStream = function (_Stream) {
  _inherits(OStream, _Stream);

  function OStream(id, session) {
    _classCallCheck(this, OStream);

    var _this = _possibleConstructorReturn(this, (OStream.__proto__ || Object.getPrototypeOf(OStream)).call(this, id, session));

    _this.current_data_buffer = new Buffer(0);
    _this.current_header_buffer = new Buffer(0);
    _this.flag_backlog = [];

    _this.on('recieve_frame', _this.recieve_frame);
    _this.on('transition_state', _this.transition_state);
    return _this;
  }

  _createClass(OStream, [{
    key: 'recieve_frame',
    value: function recieve_frame(frame) {
      console.log();
      console.log('Stream ID: ' + this.stream_id);
      console.log('Frame type: ' + _constants.FrameTypes.keys[frame.type]);
      console.log(frame);
      this.delegate_frame(frame);
      this.log_flags(frame);
    }
  }, {
    key: 'handle_idle_frame',
    value: function handle_idle_frame(frame) {
      switch (frame.type) {
        case _constants.FrameTypes.HEADERS:
          this.emit('transition_state', _constants.StreamState.STREAM_OPEN);
          if (frame.flags.END_STREAM) {
            this.emit('transition_state', _constants.StreamState.STREAM_HALF_CLOSED_LOCAL);
          }
          this.session.send_frame_ostream(frame);
          break;
        case _constants.FrameTypes.PUSH_PROMISE:
          this.emit('transition_state', _constants.StreamState.STREAM_RESERVED_LOCAL);
          break;
        case _constants.FrameTypes.PRIORITY:
          break;
        default:
          throw new _error.ConnectionError(_constants.ErrorCodes.PROTOCOL_ERROR, 'invalid frame recieved: ' + _constants.FrameTypes.keys[frame.type], this.stream_id);
      }
    }
  }, {
    key: 'handle_reserved_local_frame',
    value: function handle_reserved_local_frame(frame) {
      if (!this.check_flag('END_HEADERS') && [_constants.FrameTypes.CONTINUATION, _constants.FrameTypes.HEADERS].indexOf(frame.type) != -1) throw new _error.ConnectionError(_constants.ErrorCodes.PROTOCOL_ERROR, 'not finished sending headers');
      switch (frame.type) {
        case _constants.FrameTypes.HEADERS:
          this.emit('transition_state', _constants.StreamState.STREAM_HALF_CLOSED_REMOTE);
          if (frame.flags.END_STREAM) {
            this.emit('transition_state', _constants.StreamState.STREAM_CLOSED);
          }
          this.session.send_frame_ostream(frame);
          break;
        case _constants.FrameTypes.DATA:
        case _constants.FrameTypes.CONTINUATION:
          if (frame.flags.END_STREAM) {
            this.emit('transition_state', _constants.StreamState.STREAM_CLOSED);
          }
          this.session.send_frame_ostream(frame);
          break;
        case _constants.FrameTypes.RST_STREAM:
          this.emit('transition_state', _constants.StreamState.STREAM_CLOSED);
          this.delegate_frame(frame);
          break;
        case _constants.FrameTypes.PRIORITY:
        case _constants.FrameTypes.WINDOW_UPDATE:
          break;
        default:
          throw new _error.ConnectionError(_constants.ErrorCodes.PROTOCOL_ERROR, 'invalid frame recieved: ' + _constants.FrameTypes.keys[frame.type], this.stream_id);
      }
    }
  }, {
    key: 'handle_open_frame',
    value: function handle_open_frame(frame) {
      if (!this.check_flag('END_HEADERS') && frame.type != _constants.FrameTypes.CONTINUATION) throw new _error.ConnectionError(_constants.ErrorCodes.PROTOCOL_ERROR, 'not finished sending headers');
      switch (frame.type) {
        case _constants.FrameTypes.CONTINUATION:
          if (this.check_flag('END_HEADERS')) throw new _error.ConnectionError(_constants.ErrorCodes.INTERNAL_ERROR, 'sending continuation frame after END_HEADERS flag set');
          if (frame.flags.END_STREAM) this.emit('transition_state', _constants.StreamState.STREAM_HALF_CLOSED_REMOTE);
          this.session.send_frame_ostream(frame);
          break;
        case _constants.FrameTypes.DATA:
          if (this.check_flag('END_STREAM')) throw new _error.ConnectionError(_constants.ErrorCodes.INTERNAL_ERROR, 'sending data frame after END_STREAM flag set');
          if (frame.flags.END_STREAM) this.emit('transition_state', _constants.StreamState.STREAM_HALF_CLOSED_REMOTE);
          this.session.send_frame_ostream(frame);
          break;
        case _constants.FrameTypes.RST_STREAM:
          this.emit('transition_state', _constants.StreamState.RST_STREAM);
          break;
      }
    }
  }, {
    key: 'handle_half_closed_remote_frame',
    value: function handle_half_closed_remote_frame(frame) {
      switch (frame.type) {
        case _constants.FrameTypes.WINDOW_UPDATE:
        case _constants.FrameTypes.PRIORITY:
          break;
        case _constants.FrameTypes.RST_STREAM:
          this.emit('transition_state', _constants.StreamState.STREAM_CLOSED);
          break;
        default:
          throw new _error.StreamError(_constants.ErrorCodes.STREAM_CLOSED, 'invalid frame recieved: ' + _constants.FrameTypes.keys[frame.type], this.stream_id);
      }
    }
  }, {
    key: 'handle_closed_frame',
    value: function handle_closed_frame(frame) {
      switch (frame.type) {
        case _constants.FrameTypes.PRIORITY:
        case _constants.FrameTypes.WINDOW_UPDATE:
        case _constants.FrameTypes.RST_STREAM:
          break;
        default:
          throw new _error.StreamError(_constants.ErrorCodes.STREAM_CLOSED, 'invalid frame recieved: ' + _constants.FrameTypes.keys[frame.type], this.stream_id);
      }
    }
  }, {
    key: 'handle_half_closed_local_frame',
    value: function handle_half_closed_local_frame(frame) {
      if (frame.flags.END_STREAM) this.emit('transition_state', _constants.StreamState.STREAM_CLOSED);
      switch (frame.type) {
        case _constants.StreamState.RST_STREAM:
          this.emit('transition_state', _constants.StreamState.STREAM_CLOSED);
          break;
      }
    }
  }, {
    key: 'transition_state',
    value: function transition_state(new_state) {
      console.log(_constants.StreamState.keys[new_state]);
      switch (this.stream_state) {
        case _constants.StreamState.STREAM_IDLE:
          if ([_constants.StreamState.STREAM_OPEN, _constants.StreamState.STREAM_RESERVED_LOCAL, _constants.StreamState.STREAM_RESERVED_REMOTE].indexOf(new_state) != -1) this.stream_state = new_state;
          break;
        case _constants.StreamState.STREAM_RESERVED_LOCAL:
          if ([_constants.StreamState.STREAM_CLOSED, _constants.StreamState.STREAM_HALF_CLOSED_REMOTE].indexOf(new_state) != -1) this.stream_state = new_state;
          break;
        case _constants.StreamState.STREAM_RESERVED_REMOTE:
          if ([_constants.StreamState.STREAM_CLOSED, _constants.StreamState.STREAM_HALF_CLOSED_LOCAL].indexOf(new_state) != -1) this.stream_state = new_state;
          break;
        case _constants.StreamState.STREAM_OPEN:
          if ([_constants.StreamState.STREAM_CLOSED, _constants.StreamState.STREAM_HALF_CLOSED_REMOTE, _constants.StreamState.STREAM_HALF_CLOSED_LOCAL].indexOf(new_state) != -1) this.stream_state = new_state;
          break;
        case _constants.StreamState.STREAM_HALF_CLOSED_REMOTE:
          if (_constants.StreamState.STREAM_CLOSED == new_state) this.stream_state = new_state;
          break;
        case _constants.StreamState.STREAM_HALF_CLOSED_LOCAL:
          if (_constants.StreamState.STREAM_CLOSED == new_state) this.stream_state = new_state;
          break;
      }
    }
  }, {
    key: 'delegate_frame',
    value: function delegate_frame(frame) {
      switch (frame.type) {
        case _constants.FrameTypes.PRIORITY:
          this.stream_dependency = frame.stream_dependency;
          this.weight = frame.weight;
          this.exclusive = frame.exclusive;
          return this.session.priority.update_stream(this);
      }
      switch (this.stream_state) {
        case _constants.StreamState.STREAM_IDLE:
          this.handle_idle_frame(frame);
          break;
        case _constants.StreamState.STREAM_RESERVED_LOCAL:
          this.handle_reserved_local_frame(frame);
          break;
        case _constants.StreamState.STREAM_OPEN:
          this.handle_open_frame(frame);
          break;
        case _constants.StreamState.STREAM_HALF_CLOSED_REMOTE:
          this.handle_half_closed_remote_frame(frame);
          break;
        case _constants.StreamState.STREAM_CLOSED:
          this.handle_closed_frame(frame);
          break;
        case _constants.StreamState.STREAM_HALF_CLOSED_LOCAL:
          this.handle_half_closed_local_frame(frame);
          break;
        default:
          console.log('Not handling state: ' + this.stream_state);
      }
    }
  }, {
    key: 'log_flags',
    value: function log_flags(frame) {
      var _this2 = this;

      Object.entries(frame.flags).forEach(function (flag_pair) {
        if (flag_pair[1]) _this2.flag_backlog.push(flag_pair[0]);
      });
      console.log(this.flag_backlog);
    }
  }, {
    key: 'check_flag',
    value: function check_flag(flag) {
      if (typeof flag !== 'string') return;
      for (var i = this.flag_backlog.length - 1; i >= 0; i--) {
        if (this.flag_backlog[i] == flag) return true;
      }
      return false;
    }
  }]);

  return OStream;
}(_stream2.default);

exports.default = OStream;