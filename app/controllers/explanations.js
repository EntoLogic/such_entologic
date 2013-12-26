var mongoose    = require('mongoose'),
    Explanation = mongoose.model('Explanation');

exports.create = function(req, res) {
  var userId = req.user ? req.user._id : null;
  // var newExplanation = new Explanation({
  console.log(req.body);
  new Explanation({
    user: userId,
    plainCodeInput: req.body.code,
    pLang: req.body.pLang,
    nLang: req.body.nLang
  }).save(function(err, newExplanation) {
    if (err) return res.json(err);
    res.json(newExplanation);
  });
};

exports.show = function(req, res) {

};

exports.update = function(req, res) {

};