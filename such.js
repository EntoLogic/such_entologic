var express = require('express'),
    passport = require("passport"),
	  fs = require('fs'),
		http = require('http'),
		path = require('path'),
    repl = require("repl");

//Load configurations
//if test env, load example file
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
    config = require('./config/config'),
    auth = require('./config/middlewares/authorization'),
    mongoose = require('mongoose');

mongoose.set('debug', env == 'development');

//Bootstrap db connection
var db = mongoose.connect(config.db);

db.connection.on('error', function(){
  console.log("Mongo connection error with the url: " + config.db);
  process.exit(1);
});

db.connection.once('open', function() {
  console.log("Connected to mongo :P");
});

//Bootstrap models
var models_path = __dirname + '/app/models';
var walk = function(path) {
  fs.readdirSync(path).forEach(function(file) {
    var newPath = path + '/' + file;
    var stat = fs.statSync(newPath);
    if (stat.isFile()) {
      if (/(.*)\.(js$|coffee$)/.test(file)) {
        require(newPath);
      }
    } else if (stat.isDirectory()) {
      walk(newPath);
    }
  });
};
walk(models_path);

//bootstrap passport config
require('./config/passport')(passport);

var app = express();

require("./config/express")(app, passport, db);

//Bootstrap routes
require('./config/routes')(app, passport, auth);
// require('./config/routes')(app);

//Start the app by listening on <port>
var port = process.env.PORT || config.port;
app.listen(port);
console.log('started on port ' + port);

repl.start({
  prompt: "node via stdin> ",
  input: process.stdin,
  output: process.stdout
});