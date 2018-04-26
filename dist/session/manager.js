'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _session = require('./session');

var _session2 = _interopRequireDefault(_session);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SessionManager = function (_EventEmitter) {
  _inherits(SessionManager, _EventEmitter);

  function SessionManager() {
    _classCallCheck(this, SessionManager);

    var _this = _possibleConstructorReturn(this, (SessionManager.__proto__ || Object.getPrototypeOf(SessionManager)).call(this));

    _this.sessions = {};
    _this.next_id = 0;
    _this.paths = {
      get: {},
      post: {},
      head: {}
    };

    _this.on('session_close', _this.session_close);
    _this.add_session({ on: function on() {}, write: function write(data) {} });
    return _this;
  }

  _createClass(SessionManager, [{
    key: 'add_session',
    value: function add_session(socket) {
      this.sessions[this.next_id] = new _session2.default(socket, this.next_id, this);
      this.next_id++;
    }
  }, {
    key: 'get_handlers',
    value: function get_handlers(method, path) {
      var handlers = this.paths[method.toLowerCase()][path];
      if (!handlers || handlers.length == 0) return [this.request_404_handler];
      return handlers;
    }
  }, {
    key: 'session_close',
    value: function session_close(session) {
      delete this.sessions[session.session_id];
    }
  }, {
    key: 'register_get',
    value: function register_get(path, handler) {
      if (!this.paths.get[path]) this.paths.get[path] = [];
      if (!this.paths.head[path]) this.paths.head[path] = [];
      this.paths.head[path].push(handler);
      this.paths.get[path].push(handler);
    }
  }, {
    key: 'register_post',
    value: function register_post(path, handler) {
      if (!this.paths.post[path]) this.paths.post[path] = [];
      this.paths.post[path].push(handler);
    }
  }, {
    key: 'request_404_handler',
    value: function request_404_handler(request, response) {
      response.status(404).send('error fetching ' + request.headers[':path'] + ' resource not found');
    }
  }]);

  return SessionManager;
}(_events2.default);

exports.default = SessionManager;