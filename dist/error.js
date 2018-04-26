'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StreamError = exports.ConnectionError = undefined;

var _constants = require('./constants');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ConnectionError = exports.ConnectionError = function (_Error) {
  _inherits(ConnectionError, _Error);

  function ConnectionError(error, msg, stream_id) {
    _classCallCheck(this, ConnectionError);

    var _this = _possibleConstructorReturn(this, (ConnectionError.__proto__ || Object.getPrototypeOf(ConnectionError)).call(this, _constants.ErrorCodes.keys[error] + (typeof msg != 'undefined' ? ': ' + msg : '')));

    _this.type = 0x1;

    Error.captureStackTrace(_this, ConnectionError);
    _this.error_code = error;
    _this.stream_id = stream_id || -1;
    return _this;
  }

  return ConnectionError;
}(Error);

var StreamError = exports.StreamError = function (_Error2) {
  _inherits(StreamError, _Error2);

  function StreamError(error, msg, stream_id) {
    _classCallCheck(this, StreamError);

    console.log('1');

    var _this2 = _possibleConstructorReturn(this, (StreamError.__proto__ || Object.getPrototypeOf(StreamError)).call(this, _constants.ErrorCodes.keys[error] + (typeof msg != 'undefined' ? ': ' + msg : '')));

    _this2.type = 0x2;

    console.log('2');
    Error.captureStackTrace(_this2, StreamError);
    console.log('3');
    _this2.error_code = error;
    console.log('4');
    _this2.stream_id = stream_id || -1;
    return _this2;
  }

  return StreamError;
}(Error);
/*
let error = ErrorCodes.INTERNAL_ERROR;
let msg = "invalid";
let stream_id = 1;
let new_stream_error = new StreamError(error, msg, stream_id)
console.log(new_stream_error)
*/