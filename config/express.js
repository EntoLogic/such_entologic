/**
 * Module dependencies.
 */
var express = require('express'),
    config = require('./config'),
    RedisStore = require('connect-redis')(express);

module.exports = function(app, passport, db) {
  app.use(express.logger("short"));
  app.set('showStackError', true);

  //Setting the static folder
  app.use(express.favicon(config.root + '/public/favicon.ico'));
  app.use(express.static(config.root + '/public'));

  app.configure(function() {
    //cookieParser should be above session
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

    //routes should be at the last
    app.use(app.router);
    //TODO add 404, 500 here
  });
};
