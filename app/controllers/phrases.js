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

exports.show = function(req, res) {
  Phrase.findOne({_id: req.params.pId}, function(err, phrase) {
    if (err) return res.json({errors: "Error finding phrase"});
    if (phrase) {
      res.json(phrase);
    } else {
      res.json(404, {errors: ["Could not find Phrase with that id!"]});
    }
  });
};

exports.update = function(req, res) {
  var userId = req.user && req.user._id;
  Phrase.findOne({_id: req.params.pId, user: userId}, function(err, phrase) {
    if (err) return res.json(err);
    if (phrase) {
      _.extend(phrase, Phrase.allowed(req.body)); // Slap on any (allowed) changes :P
      phrase.save(function(err, updatedPhrase) {
        if (err) return res.json(400, {errors: valErrors(phrase)});
        res.json(updatedPhrase);
      });
    } else {
      res.json(404, {errors: ["Could not find Phrase with that id!"]});
    }
  });
};

exports.list = function(req, res) {
	Phrase.find().sort({updatedAt: -1}).exec(function(err, listOfPhrases) {
		if (err) return res.json(500, {errors: ["Error loading phrases"]});
		res.json(listOfPhrases);
	});
};