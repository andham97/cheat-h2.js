'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _tls = require('tls');

var _tls2 = _interopRequireDefault(_tls);

var _manager = require('./session/manager');

var _manager2 = _interopRequireDefault(_manager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var session_manager = void 0;

var http2 = function () {
  function http2(options) {
    _classCallCheck(this, http2);

    if (!options || !options.key || !options.cert) throw new Error('Need private key and public certificate for server initiation');
    this.key = options.key;
    this.cert = options.cert;
    session_manager = new _manager2.default();
    options.ALPNProtocols = ['h2'];
    this.server = _tls2.default.createServer(options, function (socket) {
      session_manager.add_session(socket);
    });
  }

  _createClass(http2, [{
    key: 'get',
    value: function get(path, handler) {
      if (!path || !handler) throw new Error('Path or handler not specified');
      session_manager.register_get(path, handler);
    }
  }, {
    key: 'post',
    value: function post(path, handler) {
      if (!path || !handler) throw new Error('Path or handler not specified');
      session_manager.register_post(path, handler);
    }
  }, {
    key: 'use',
    value: function use(path, handler) {
      if (!handler) session_manager.register_middleware(path);else session_manager.register_path(path, handler);
    }
  }, {
    key: 'listen',
    value: function listen(port) {
      if (!port) return;
      this.server.listen(port);
    }
  }]);

  return http2;
}();

exports.default = http2;