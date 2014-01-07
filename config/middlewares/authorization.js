/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.json(401, {auth: 0, errors: ["Must be signed in!"]});
  }
  next();
};

// Give a 200 instead of a 401
exports.requiresLogin200 = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.json(200, {auth: 0, errors: ["Must be signed in!"]});
  }
  next();
};

exports.adminOnly = function(req, res, next) {
  if (!(req.user.admin === 1)) {
    return res.json(401, {auth: 1, errors: ["Forbidden Action!"]});
  }
  next();
};

// /**
//  * User authorizations routing middleware
//  */
// exports.user = {
//   hasAuthorization: function(req, res, next) {
//     if (req.profile.id != req.user.id) {
//       return res.send(401, 'User is not authorized');
//     }
//     next();
//   }
// };

// *
//  * Article authorizations routing middleware
 
// exports.article = {
//   hasAuthorization: function(req, res, next) {
//     if (req.article.user.id != req.user.id) {
//       return res.send(401, 'User is not authorized');
//     }
//     next();
//   }
// };