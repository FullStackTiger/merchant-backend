'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Restaurant = _mongoose2.default.model('Restaurant', {
  id: String,
  name: String,
  address: {
    street: String,
    city: String,
    province: String,
    postal: String,
    phone: String
  },
  logoUrl: String
});

exports.default = Restaurant;