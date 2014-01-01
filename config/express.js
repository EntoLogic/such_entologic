/**
 * Module dependencies.
 */
var express = require('express'),
    config = require('./config'),
    misc = require("./middlewares/misc")
    RedisStore = require('connect-redis')(express);

module.exports = function(app, passport, db) {
  app.use(express.logger("short"));
  app.set('showStackError', true);

  app.configure(function() {
    //Setting the static folder
    app.use(express.favicon(config.root + '/public/favicon.ico'));
    app.use(express.static(config.root + '/public'));    //cookieParser should be above session

    app.use(express.cookieParser());

    // request body parsing middleware should be above methodOverride
    app.use(express.urlencoded());
    app.use(express.json());
    app.use(express.methodOverride());

    var redisObject = {
      store: new RedisStore({
        host: config.redis.host,
        port: config.redis.port,
        db: config.redis.dbNumber,
        pass: config.redis.password
      }),
      secret: config.sessionsSecret
    };

    redisObject.store.client.on("error", function(err) {
      console.error("Error connecting to redis!", err);
      process.exit(1);
    });

    //express/mongo session storage
    app.use(express.session(redisObject));

    //use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    if (!config.disableXsrfProtection) {
      app.use(express.csrf());
      app.use(function(req, res, next) {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        next();
      });
    }
    app.disable('x-powered-by');

    //routes should be at the last
    app.use(app.router);
    //TODO add 404, 500 here
  });
};
