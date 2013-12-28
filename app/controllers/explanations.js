var mongoose    = require('mongoose'),
    Explanation = mongoose.model('Explanation');

exports.create = function(req, res) {
  var userId = req.user ? req.user._id : null;
  // var newExplanation = new Explanation({
  new Explanation({
    user: userId,
    plainCodeInput: req.body.code,
    pLang: req.body.pLang,
    nLang: req.body.nLang
  }).save(function(err, newExplanation) {
    if (err) return res.json(err); // TODO: only send back required info
    res.json(newExplanation);
  });
};

exports.show = function(req, res) {
  Explanation.findById(req.params.eId, "-__v", function(err, ex) {
    if (err) return res.json(err);
    res.json(ex);
  });
};

exports.update = function(req, res) {

};