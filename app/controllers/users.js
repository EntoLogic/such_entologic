var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    _ = require("underscore");

var valErrors = function(valErrorsObj) {
  return _.reduce(valErrorsObj.errors, function(memo, val, key, obj) {
    memo.push(key + " " + val.message);
    return memo;
  }, []);
};

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
  var user = new User(User.allowed(req.body)); // TODO, fix this only passing allowed attr's

  user.provider = 'local';
    
  user.save(function(err, savedUser) {
    if (err) {
      //Send back only necessary errors
      return res.json(400, {errors: valErrors(err)});
    }
    return res.json(savedUser.cleanForApi());
  });
};

/**
 *  Show profile
 */
exports.show = function(req, res) {
  var uq = req.params.userquery;
  var uqLen = uq.length;
  var query;
  if (uqLen <= 20 && uqLen >= 2) {
    query = User.findOne({username: uq});
  } else if (uqLen === 24) {
    query = User.findOne({_id: uq});
  } else {
    return res.json({errors: "Invalide user query"});
  }
  query.exec(function(err, user) {
    if (err) return next(err);
    // if (!user) return next(new Error('Failed to load User ' + username));
    if (user) {
      res.json(user.cleanForApi());
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
