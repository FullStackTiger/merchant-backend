'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _db = require('./db');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('dotenv').config();

var mongoDbUsername = process.env.DB_USER || '';
var mongoDbPassword = process.env.DB_PASS || '';

var CONN = 'mongodb://' + mongoDbUsername + ':' + mongoDbPassword + '@ds137054.mlab.com:37054/swift-ordering';

_mongoose2.default.Promise = global.Promise;
var app = (0, _express2.default)();

app.use((0, _morgan2.default)('dev'));
app.use(_bodyParser2.default.json());

app.get('/', function (req, res) {
  res.send({ message: 'hello world!' });
});

app.get('/api/v1/restaurants', function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var restaurants;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _mongoose2.default.connect(CONN, { useMongoClient: true });

            // TODO: search near lat/lng
            _context.next = 3;
            return _db.Restaurant.find().limit(50);

          case 3:
            restaurants = _context.sent;

            res.status(200).json(restaurants);
            _mongoose2.default.disconnect();

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());

var httpServer = _http2.default.Server(app);
httpServer.listen(5000, function () {
  // eslint-disable-next-line no-console
  console.log('Backend Server listening on port 5000');
});