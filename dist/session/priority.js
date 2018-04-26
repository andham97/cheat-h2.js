'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stream = require('./stream');

var _stream2 = _interopRequireDefault(_stream);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var default_weight = 16;

var Priority = function () {
  function Priority() {
    _classCallCheck(this, Priority);

    this.priority_queue = [];
  }

  _createClass(Priority, [{
    key: 'add_stream',
    value: function add_stream(stream) {
      if (stream.weight == -1) stream.weight = default_weight;
      var dependency_found = false;
      for (var i = 0; i < this.priority_queue.length; i++) {
        if (!dependency_found && this.priority_queue[i].stream_id == stream.stream_dependency) dependency_found = true;else if (dependency_found) {
          if (this.priority_queue[i].stream_dependency == stream.stream_dependency && this.priority_queue[i].weight < stream.weight) {
            this.priority_queue = this.priority_queue.slice(0, i).concat([stream], this.priority_queue.slice(i, this.priority_queue.length));
            return;
          } else if (this.priority_queue[i].stream_dependency != stream.stream_dependency) {
            this.priority_queue = this.priority_queue.slice(0, i).concat([stream], this.priority_queue.slice(i, this.priority_queue.length));
            return;
          }
        }
      }
      this.priority_queue.push(stream);
    }
  }, {
    key: 'get_next_streams',
    value: function get_next_streams() {
      if (this.priority_queue.length == 0) return [];
      var current_stream = [];
      var closed_streams = [];
      var i = 0;
      while (i < this.priority_queue.length && this.priority_queue[i].stream_dependency == 0) {
        if (this.priority_queue[i].stream_state == _constants.StreamState.STREAM_CLOSED) {
          closed_streams.push(this.priority_queue[i].stream_id);
          this.priority_queue.splice(i, 1);
        } else {
          current_stream.push(this.priority_queue[i]);
          i++;
        }
      }
      for (; i < this.priority_queue.length; i++) {
        if (closed_streams.indexOf(this.priority_queue[i].stream_dependency) != -1) this.priority_queue[i].stream_dependency = 0;
      }
      return current_stream;
    }
  }, {
    key: 'update_stream',
    value: function update_stream(stream) {
      for (var i = 0; i < this.priority_queue.length; i++) {
        if (this.priority_queue[i].stream_id == stream.stream_id) {
          this.priority_queue.splice(i, 1);
          break;
        }
      }
      this.add_stream(stream);
    }
  }]);

  return Priority;
}();

exports.default = Priority;