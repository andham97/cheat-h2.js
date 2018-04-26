'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var IStream = function (_Stream) {
  _inherits(IStream, _Stream);

  function IStream(id, session) {
    _classCallCheck(this, IStream);

    var _this = _possibleConstructorReturn(this, (IStream.__proto__ || Object.getPrototypeOf(IStream)).call(this, id, session));

    _this.current_data_buffer = new Buffer(0);
    _this.current_header_buffer = new Buffer(0);
    _this.flag_backlog = [];

    _this.on('recieve_frame', _this.recieve_frame);
    _this.on('transition_state', _this.transition_state);
    return _this;
  }

  _createClass(IStream, [{
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
          this.current_header_buffer = Buffer.concat([frame.payload]);
          if (frame.flags.END_STREAM) {
            this.emit('transition_state', _constants.StreamState.STREAM_HALF_CLOSED_REMOTE);
          }
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
      switch (frame.type) {
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
          if (this.check_flag('END_HEADERS')) throw new _error.ConnectionError(_constants.ErrorCodes.PROTOCOL_ERROR, 'recieved continuation frame after END_HEADERS flag set');
          this.current_header_buffer = Buffer.concat([this.current_header_buffer, frame.payload]);
          if (frame.flags.END_STREAM) this.emit('transition_state', _constants.StreamState.STREAM_HALF_CLOSED_REMOTE);
          break;
        case _constants.FrameTypes.DATA:
          this.current_data_buffer = Buffer.concat([this.current_data_buffer, frame.payload]);
          if (frame.flags.END_STREAM) {
            this.emit('transition_state', _constants.StreamState.STREAM_HALF_CLOSED_REMOTE);
          }
          break;
        case _constants.FrameTypes.RST_STREAM:
          this.emit('transition_state', _constants.StreamState.RST_STREAM);
          break;
      }
    }
  }, {
    key: 'handle_reserved_remote_frame',
    value: function handle_reserved_remote_frame(frame) {
      switch (frame.type) {
        case _constants.FrameTypes.HEADERS:
          this.current_header_buffer = Buffer.concat([frame.payload]);
          this.emit('transition_state', _constants.StreamState.STREAM_HALF_CLOSED_LOCAL);
          this.delegate_frame(frame);
          break;
        case _constants.FrameTypes.RST_STREAM:
          this.emit('transition_state', _constants.StreamState.STREAM_CLOSED);
          break;
        case _constants.FrameTypes.PRIORITY:
          break;
        default:
          throw new _error.ConnectionError(_constants.ErrorCodes.PROTOCOL_ERROR, 'invalid frame recieved: ' + _constants.FrameTypes.keys[frame.type], this.stream_id);
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
        case _constants.StreamState.STREAM_RESERVED_REMOTE:
          this.handle_reserved_remote_frame(frame);
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
    key: 'handle_request',
    value: function handle_request() {
      var _this2 = this;

      var headers = this.session.in_context.decompress(this.current_header_buffer);
      this.session.update_headers(headers);
      var request = new _request2.default(this.session.headers, this.current_data_buffer);
      var response = new _response2.default(this.session.headers);
      console.log(request);
      var method = request.headers[':method'];
      var path = request.headers[':path'];
      var handlers = this.session.manager.get_handlers(method, path);
      var next_handler = this.generate_handler_chain(request, response, handlers);
      if (next_handler) next_handler();
      var frames = this.convert_response(request, response);
      frames.forEach(function (frame) {
        _this2.send_frame(frame);
      });
    }
  }, {
    key: 'generate_handler_chain',
    value: function generate_handler_chain(req, res, handlers, i) {
      var _this3 = this;

      if (i === undefined) i = 0;
      if (!handlers || handlers.length == 0) return;
      return function () {
        if (i < handlers.length - 1) handlers[i](req, res, _this3.generate_handler_chain(req, res, handlers, i + 1));else handlers[i](req, res, function () {});
      };
    }
  }, {
    key: 'log_flags',
    value: function log_flags(frame) {
      var _this4 = this;

      Object.entries(frame.flags).forEach(function (flag_pair) {
        if (flag_pair[1]) _this4.flag_backlog.push(flag_pair[0]);
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
  }, {
    key: 'convert_response',
    value: function convert_response(request, response) {
      if (!response.payload) throw new Error('no response to client');
      response.headers['content-length'] = response.payload.length;
      var frames = [];
      var push_frames = [];
      var header_frame = new _header2.default();
      header_frame.stream_id = this.stream_id;
      header_frame.flags.END_HEADERS = true;

      var headers = Object.entries(response.headers).map(function (e) {
        return new _hpack.Entry(e[0], e[1]);
      });
      headers = headers.sort(function (a, b) {
        if (a.name[0] == ':' && b.name[0] != ':') return -1;else if (a.name[0] != ':' && b.name[0] == ':') return 1;
        return 0;
      });
      for (var i = 0; i < response.required_paths.length; i++) {
        var path = response.required_paths[i];
        var current_headers = _extends({}, this.session.headers);
        current_headers[':path'] = '/index.js';
        var current_request = new _request2.default(current_headers, new Buffer(0));
        var current_response = new _response2.default(current_headers);
        var next_handler = this.generate_handler_chain(current_request, current_response, this.session.manager.get_handlers(path.method, path.path));
        if (next_handler) next_handler();
        var push_promise = new _push_promise2.default();
        push_promise.flags.END_HEADERS = true;
        push_promise.promised_id = 2; // TODO: fix ostream
        push_promise.stream_id = this.stream_id;
        push_promise.payload = this.session.out_context.compress(Object.entries(current_headers).map(function (header) {
          return new _hpack.Entry(header[0], header[1]);
        }));
        var current_push_frames = this.convert_response(current_request, current_response);
        current_push_frames.forEach(function (frame) {
          frame.stream_id = 2;
        });
        push_frames = push_frames.concat(current_push_frames);
        frames.push(push_promise);
      }
      header_frame.payload = this.session.out_context.compress(headers);
      if (response.payload.length != 0 && request.headers[':method'] != 'HEAD') {
        var data_frame = new _data2.default();
        data_frame.stream_id = this.stream_id;
        data_frame.flags.END_STREAM = true;
        data_frame.payload = response.payload;
        frames.push(header_frame, data_frame);
      } else {
        header_frame.flags.END_STREAM = true;
        frames.push(header_frame);
      }
      frames = frames.concat(push_frames);
      return frames;
    }
  }, {
    key: 'send_frame',
    value: function send_frame(frame) {
      switch (this.stream_state) {
        case _constants.StreamState.STREAM_HALF_CLOSED_REMOTE:
          if (frame.flags.END_STREAM) this.emit('transition_state', _constants.StreamState.STREAM_CLOSED);else if (frame instanceof _rst_stream2.default) this.emit('transition_state', _constants.StreamState.STREAM_CLOSED);
          break;
      }
      this.session.send_frame_istream(frame);
    }
  }]);

  return IStream;
}(_stream2.default);

exports.default = IStream;