/**
 * Created by ZIV on 28/12/2016.
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var mongoose = require('./config/mongoose'),
    express = require('./config/express'),
    passport = require('./config/passport');

var db = mongoose();
var app = express(db);
var passport = passport();

app.listen(8080);
module.exports = app;
console.log('Server running at http://quiet-anchorage-91080.herokuapp.com/');