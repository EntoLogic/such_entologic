var mongoose = require('mongoose'),
    config = require('../../config/config'),
    Schema = mongoose.Schema,
    timestamps = require('./mongoose_plugins/super_timestamp'),
    _ = require("underscore"),
    phraseTypeList = require(config.root + "/public/phrase_type_list"),
    langsList = require("../../config/langs");

var getPhraseType = function(pName) {
  return _.find(phraseTypeList, function(p) {
    return p.phrase_type === pName;
  });
};
var conditionTypes = ["presence", "comparison"];
// TODO Require validations (and others)

var ClauseSchema = new Schema({
  words: [String],
  flags: [{type: Schema.Types.ObjectId, ref: 'User'}],
  condition: {
    conditionType: String,
    reverse: Boolean,
    nodeAttribute: String,
    comparator: String,
    comparedWith: Number
  }
});
// http://mongoosejs.com/docs/subdocs.html

var PhraseSchema = new Schema({
  phraseName: {type: String, index: true, required: 'is required!'},
  pLang: {type: String, index: true, required: 'is required!'},
  nLang: {type: String, index: true, required: 'is required!'},
  inUse: Boolean,
  voteCache: {type: Number, default: 0, index: true},
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  forkedFrom: {
    type: Schema.Types.ObjectId,
    ref: 'Phrase'
  },
  clauses: [ClauseSchema]
});


/**
 * Validations
 */
PhraseSchema.path("phraseName").validate(function(phraseName) {
  return Boolean(getPhraseType(phraseName));
}, 'must be valid.');

ClauseSchema.path('words').validate(function(words) {
  return words.length;
}, 'must have at least one string.');

ClauseSchema.path('condition.conditionType').validate(function(cT) {
  return _.contains(conditionTypes, cT);
}, 'must be presence or comparison.');

// ClauseSchema.path('condition.nodeAttribute').validate(function(cT) {
// // Check the phrase type if it has an attribute of this type
// }, 'must be a valid attribute of phrase.');

PhraseSchema.pre("validate", function(next) {
  if (!this.clauses.length) this.invalidate('clauses', 'must not be empty.');
  next();
});


PhraseSchema.statics.allowed = function(requested) {
  // Function which selects the fields which are allowed to be saved from the request object
  var picked = _.pick(requested, [
    "pLang",
    "nLang",
    "phraseName",
    "clauses"
  ]);
  return picked;
};


PhraseSchema.plugin(timestamps, {
  createdAt: { index: true },
  updatedAt: { index: true }
});

mongoose.model('Phrase', PhraseSchema);