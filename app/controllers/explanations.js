var mongoose = require('mongoose'),
    Explanation = mongoose.model('Explanation'),
    _ = require("underscore");

exports.create = function(req, res) {
  var newExp = new Explanation(Explanation.allowed(req.body));

  newExp.user = req.user && req.user._id;

  var sessId = req.sessionID;
  if (!sessId) {
    return res.json({errors: ["Authentication Failure"]});
  }
  if (!newExp.user) newExp.sessionId = sessId; // Set the sessionId on creation if there is no user

  if (req.query.explain === "yes") {
    newExp.lastTranslated = null; // If they want explanation, set lastTranslated to null so the translator picks it up
  }
  newExp.save(function(err, exp) {
    if (err) return res.json(400, err); // TODO: only send back required info
    res.json(exp.forApi());
  });
};

exports.show = function(req, res) {
  var sessId = req.sessionID;
  var userId = req.user && req.user._id;
  Explanation.findOne({
    _id: req.params.eId,
    $or: [
      {sessionId: sessId},
      {user: userId},
      {saved: 1},
      {saved: 2, user: userId}
    ]
  }, function(err, exp) {
    if (err) return res.json(err); // TODO: only send back required info
    if (exp) {
      if (exp.lastTranslated) { // Only may be accessed when last translated is not null
        res.json(exp.forApi());
      } else {
        // This is terrible but
        if (req.query.empty) {
          res.json(404, {});
        } else {
          res.json(404, {errors: ["Explanation may not be accessed during translation."]});
        }
      }
    } else {
      res.json(404, {errors: ["Could not find Explanation with that id!"]});
    }
  });
};

exports.update = function(req, res) {
  var sessId = req.sessionID;
  var userId = req.user && req.user._id;
  Explanation.findOne({_id: req.params.eId, $or: [{sessionId: sessId}, {user: userId}]}, function(err, exp) {
    if (err) return req.json(err); // TODO: only send back required info
    if (exp) {
      if (!exp.lastTranslated) { // Only may be accessed when last translated is not null
        return res.json(404, {errors: ["Explanation may not be accessed during translation."]});
      }
      _.extend(exp, Explanation.allowed(req.body)); // Slap on any (allowed) changes :P
      if (req.params.explain_now === "yes") {
        ex.lastTranslated = null;
      }
      exp.save(function(err, updatedExp) {
        if (err) return res.json(400, err);
        res.json(updatedExp.forApi());
      });
    } else {
      res.json(404, {errors: ["Could not find Explanation with that id!"]});
    }
  });
};