var mongoose = require('mongoose'),
    Phrase = mongoose.model('Phrase'),
    _ = require("underscore"),
    langsList = require("../../config/langs");

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

  if (!req.user.admin) {
    if (!(langsList.programming[newPhrase.pLang])) {
      return res.json({errors: ["Programming Language not available"]});
    }
    if (!(langsList.spoken[newPhrase.nLang])) {
      return res.json({errors: ["Spoken Language not available"]});
    }
  }

  newPhrase.save(function(err, phrase) {
    if (err) return res.json(400, {errors: valErrors(err)});
    res.json(phrase);
  });
};

exports.update = function(req, res) {

};

exports.list = function(req, res) {
	Phrase.find({}, function(err, listOfPhrases) {
		if (err) return res.json(500, {errors: ["Error loading phrases"]});
		res.json(listOfPhrases);
	});
};