/**
 * Module dependencies.
 */
var express = require('express'),
  mongoStore = require('connect-mongo')(express),
  config = require('./config');

module.exports = function(app, db) {
  app.set('showStackError', true);

  //Setting the fav icon and static folder
  app.use(express.favicon());
  app.use(express.static(config.root + '/public'));

  app.configure(function() {
    //cookieParser should be above session
    app.use(express.cookieParser());

    // request body parsing middleware should be above methodOverride
    app.use(express.urlencoded());
    app.use(express.json());
    app.use(express.methodOverride());

    //express/mongo session storage
    app.use(express.session({
      secret: config.sessionsSecret,
      store: new mongoStore({
        db: db.connection.db,
        collection: 'sessions'
      })
    }));

    //dynamic helpers
    // app.use(helpers(config.app.name));

    //use passport session
    // app.use(passport.initialize());
    // app.use(passport.session());

    //routes should be at the last
    app.use(app.router);
  });
};
