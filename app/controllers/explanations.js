var mongoose = require('mongoose'),
    Explanation = mongoose.model('Explanation'),
    _ = require("underscore");

var valErrors = function(valErrorsObj) {
  return _.reduce(valErrorsObj.errors, function(memo, val, key, obj) {
    memo.push(key + " " + val.message);
    return memo;
  }, []);
};

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
    if (err) return res.json(400, valErrors(err));
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
    if (err) return res.json(valErrors(err)); // TODO: only send back required info
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
    if (err) return res.json(err); // TODO: only send back required info
    if (exp) {
      if (!exp.lastTranslated) { // Only may be accessed when last translated is not null
        return res.json(404, {errors: ["Explanation may not be accessed during translation."]});
      }
      _.extend(exp, Explanation.allowed(req.body)); // Slap on any (allowed) changes :P
      if (req.query.explain === "yes") {
        exp.lastTranslated = null;
      }
      exp.save(function(err, updatedExp) {
        if (err) return res.json(400, valErrors(err));
        res.json(updatedExp.forApi());
      });
    } else {
      res.json(404, {errors: ["Could not find Explanation with that id!"]});
    }
  });
};

exports.list = function(req, res) {
  var providedUserId = req.query.forUser;
  var currentUserId = req.user && req.user._id;

  var query = Explanation.find();
  if (providedUserId) {
    query = query.where('user').equals(providedUserId);
    if (currentUserId && (providedUserId === currentUserId.toString())) {
      query = query.where('saved').in([1,2]); //Show the current user their private and public ones
    } else {
      query = query.where('saved').equals(1);
    }
  } else {
    query = query.where('saved').equals(1);
  }
  query.select('user nLang pLang title plainCodeInput saved updatedAt').exec(function(err, list){
    if (err) return res.json(500, {errors: ["Error finding explanations"]});
    res.json(200, list);
  });
};