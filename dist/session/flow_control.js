"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FlowControl = function () {
  function FlowControl() {
    _classCallCheck(this, FlowControl);

    this.incoming = 0xffff;
    this.outgoing = 0xffff;
  }

  _createClass(FlowControl, [{
    key: "send",
    value: function send(data) {
      if (this.outgoing - data.length < 0) return false;
      this.outgoing -= data.length;
      return true;
    }
  }, {
    key: "recieve",
    value: function recieve(data) {
      if (this.incoming - data.length < 0) return false;
      this.incoming -= data.length;
      return true;
    }
  }]);

  return FlowControl;
}();

exports.default = FlowControl;