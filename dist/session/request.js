'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _error = require('../error');

var _constants = require('../constants');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Request = function Request(headers, data) {
  var _this = this;

  _classCallCheck(this, Request);

  this.headers = _extends({}, headers);
  this.raw_data = Buffer.concat([new Buffer(0), data]);
  if (this.headers[':method']) {
    if (this.headers[':method'] == 'POST' && this.headers['content-length'] > 0) {
      if (this.headers['content-encoding']) throw new _error.StreamError(_constants.ErrorCodes.INTERNAL_ERROR, 'non-supported encoding type');
      console.log(data.toString());
      var body = decodeURIComponent(data.toString());
      body = body.split('&');
      this.body = {};
      body.forEach(function (element) {
        var pair = element.split('=');
        if (pair.length != 2) return;
        _this.body[pair[0]] = pair[1].split('+').join(' ');
      });
      console.log(this.body);
    } else if (this.headers[':method'] == 'GET' && this.headers[':path']) {
      var path_query = this.headers[':path'].split('?');
      this.headers[':path'] = path_query[0];
      if (path_query.length == 2) {
        this.query = {};
        var pairs = path_query[1].split('&');
        pairs.forEach(function (pair) {
          _this.query[pair[0]] = pair[1];
        });
      }
    }
  }
};

exports.default = Request;