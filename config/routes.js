module.exports = function(app, passport, auth) {
  //User Routes
  var users = require('../app/controllers/users');
  var explanations = require('../app/controllers/explanations');
  var phrases = require('../app/controllers/phrases');

  // //Setting up the users api
  app.post('/u', users.create);

  app.post('/u/in', function(req, res, next){
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        console.log(err);
        return next(err);
      }
      if (user) {
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.json(200, {auth: 1});
        });
      } else {
        res.json(401, {auth: -1, errors: [info.message]});
      }
    })(req, res, next);
  });
  app.post('/u/out', users.signout);

  app.get('/u/me', auth.requiresLogin200, users.me);
  app.get('/u/:userquery', users.show); // userquery is either a username or user object id

  // //Article Routes
  // var articles = require('../app/controllers/articles');
  // app.get('/articles', articles.all);
  // app.post('/articles', auth.requiresLogin, articles.create);
  // app.get('/articles/:articleId', articles.show);
  // app.put('/articles/:articleId', auth.requiresLogin, auth.article.hasAuthorization, articles.update);
  // app.del('/articles/:articleId', auth.requiresLogin, auth.article.hasAuthorization, articles.destroy);

  //Home route
  var home = require('../app/controllers/home');
  app.get('/test', home.test);
  app.get('/test_auth', auth.requiresLogin, home.test);

  app.post('/e', explanations.create);
  app.post('/e/:eId', explanations.update);
  app.get('/e/:eId', explanations.show);
  app.get('/e', explanations.list);

  app.post('/p', auth.requiresLogin, phrases.create);
  app.get('/p', phrases.list);
  app.get('/p/:pId', phrases.show);
  app.post('/p/:pId', auth.requiresLogin, phrases.update);
  app.post('/p/:pId/setinuse', auth.requiresLogin, auth.adminOnly, phrases.setInUse);
};
