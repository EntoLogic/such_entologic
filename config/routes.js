module.exports = function(app, passport, auth) {
  //User Routes
  var users = require('../app/controllers/users');
  var explanations = require('../app/controllers/explanations');

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
  app.get('/u/:username', users.show);

  // //Setting the facebook oauth routes
  // app.get('/auth/facebook', passport.authenticate('facebook', {
  //     scope: ['email', 'user_about_me'],
  //     failureRedirect: '/signin'
  // }), users.signin);

  // app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  //     failureRedirect: '/signin'
  // }), users.authCallback);

  // //Setting the github oauth routes
  // app.get('/auth/github', passport.authenticate('github', {
  //     failureRedirect: '/signin'
  // }), users.signin);

  // app.get('/auth/github/callback', passport.authenticate('github', {
  //     failureRedirect: '/signin'
  // }), users.authCallback);

  // //Setting the twitter oauth routes
  // app.get('/auth/twitter', passport.authenticate('twitter', {
  //     failureRedirect: '/signin'
  // }), users.signin);

  // app.get('/auth/twitter/callback', passport.authenticate('twitter', {
  //     failureRedirect: '/signin'
  // }), users.authCallback);

  // //Setting the google oauth routes
  // app.get('/auth/google', passport.authenticate('google', {
  //     failureRedirect: '/signin',
  //     scope: [
  //         'https://www.googleapis.com/auth/userinfo.profile',
  //         'https://www.googleapis.com/auth/userinfo.email'
  //     ]
  // }), users.signin);

  // app.get('/auth/google/callback', passport.authenticate('google', {
  //     failureRedirect: '/signin'
  // }), users.authCallback);

  // //Article Routes
  // var articles = require('../app/controllers/articles');
  // app.get('/articles', articles.all);
  // app.post('/articles', auth.requiresLogin, articles.create);
  // app.get('/articles/:articleId', articles.show);
  // app.put('/articles/:articleId', auth.requiresLogin, auth.article.hasAuthorization, articles.update);
  // app.del('/articles/:articleId', auth.requiresLogin, auth.article.hasAuthorization, articles.destroy);

  // //Finish with setting up the articleId param
  // app.param('articleId', articles.article);

  //Home route
  var home = require('../app/controllers/home');
  app.get('/test', home.test);
  app.get('/test_auth', auth.requiresLogin, home.test);

  app.post('/e', explanations.create);
  app.get('/e/:eId', explanations.show);

};
