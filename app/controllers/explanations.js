var mongoose = require('mongoose'),
    Explanation = mongoose.model('Explanation'),
    _ = require("underscore");

exports.create = function(req, res) {
  var newExp = new Explanation(Explanation.allowed(req.body));
  newExp.user = req.user ? req.user._id : null;
  console.log("Hey");
  if (req.query.explain === "yes") {
    console.log("YES");
    newExp.lastTranslated = null;
    console.log(newExp.lastTranslated);
  }
  newExp.save(function(err, exp) {
    if (err) return res.json(400, err); // TODO: only send back required info
    res.json(exp.forApi());
  });
};

exports.show = function(req, res) {
  Explanation.findById(req.params.eId, function(err, exp) {
    if (err) return res.json(err); // TODO: only send back required info
    // if (exp.user && (exp.user !== req.user)) { // Populate the user field if not made by the current user
    //   exp.populate("user").exec(function(err, expWithUser) {
    //     res.json(expWithUser.forApi());
    //   });
    // } else {
    //   res.json(exp.forApi());
    // }
    
    if (exp) {
      res.json(exp.forApi());
    } else {
      res.json(404, {errors: ["Could not find Explanation with that id!"]});
    }
  });
};

exports.update = function(req, res) {
  Explanation.findById(req.params.eId, function(err, exp) {
    if (err) return req.json(err); // TODO: only send back required info
    if (exp) {
      _.extend(exp, Explanation.allowed(req.body)); // Slap on any (allowed) changes :P
      if (req.params.explain_now === "yes") {
        ex.lastTranslated = null;
        ex.translationCanceledAt = null;
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