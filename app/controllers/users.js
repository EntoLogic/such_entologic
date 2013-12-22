var mongoose = require('mongoose'),
    User = mongoose.model('User');

/**
 * Auth callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};

/**
 * Logout
 */
exports.signout = function(req, res) {
  req.logout();
  res.json({sessionsStatus: 0});
};

/**
 * Session
 */
exports.session = function(req, res) {
  res.redirect('/');
};

/**
 * Create user
 */
exports.create = function(req, res) {
  var user = new User(req.body);

  user.provider = 'local';
    
  user.save(function(err, savedUser) {
    if (err) {
      //Send back only necessary errors
      return res.json({errors: err});
    }
    return res.json(savedUser.cleanForApi());
  });
};

/**
 *  Show profile
 */
exports.show = function(req, res) {
  User.findForApi({username: req.params.username}, function(err, user) {
    if (err) return next(err);
    // if (!user) return next(new Error('Failed to load User ' + username));
    if (user) {
      res.json(user);
    } else {
      res.json({errors: ["Could not find user '" + username + "'"]});
    }
  });
};

/**
 * Send User
 */
exports.me = function(req, res) {
  res.json(req.user.cleanForOwnUser());
};
