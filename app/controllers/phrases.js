var mongoose = require('mongoose'),
    Phrase = mongoose.model('Phrase'),
    _ = require("underscore");

var valErrors = function(valErrorsObj) {
  return _.reduce(valErrorsObj.errors, function(memo, val, key, obj) {
    memo.push(key + " " + val.message);
    return memo;
  }, []);
};

exports.create = function(req, res) {
	console.log("CREATE PHRASE!");
	var newPhrase = new Phrase(Phrase.allowed(req.body));
	newPhrase.user = req.user._id;

  newPhrase.save(function(err, phrase) {
    if (err) return res.json(400, {errors: valErrors(err)});
    res.json(phrase);
  });
};

exports.update = function(req, res) {

};