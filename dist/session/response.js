'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hpack = require('../hpack');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Response = function () {
  function Response() {
    _classCallCheck(this, Response);

    this.is_sent = false;
    this.required_paths = [];

    this.headers = {
      'content-type': 'text/plain; charset=utf-8',
      'content-length': 0
    };
  }

  _createClass(Response, [{
    key: 'status',
    value: function status(code) {
      this.headers[':status'] = code;
      return this;
    }
  }, {
    key: 'send',
    value: function send(data) {
      if (this.is_sent) throw new Error('Data is already sent');
      this.is_sent = true;
      if (data instanceof Buffer) this.payload = data;else if (data == undefined) this.payload = new Buffer(0);else if (data.toString) this.payload = new Buffer(data.toString(), this.headers['content-type'] && this.headers['content-type'].indexOf('charset') == -1 ? 'utf-8' : this.headers['content-type'].split('charset')[1].split(';')[0].split(' ')[0].split('=')[1]);
    }
  }, {
    key: 'sendFile',
    value: function sendFile(path) {
      if (this.is_sent) throw new Error('Data is already sent');
      this.is_sent = true;
      this.payload = _fs2.default.readFileSync(path);
    }
  }, {
    key: 'push',
    value: function push(path) {
      if (!path) return;
      if (!path.method) return;
      if (!path.path) return;else this.required_paths.push(path);
    }
  }]);

  return Response;
}();

exports.default = Response;