var mongoose = require('mongoose'),
    config = require('../../config/config'),
    Schema = mongoose.Schema,
    timestamps = require('./mongoose_plugins/super_timestamp'),
    _ = require("underscore");

var ExplanationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String },
  saved: {type: Number, index: true}, // null: not saved, 1: saved publicly, 2: saved privately
  plainCodeInput: {type: String, required: true},
  translatorMessages: [{errorMessage: String}],
  minExplainSeconds: Number,
  outputTree: String,
  lastTranslated: { type: Date, index: true },
  title: { type: String },
  // Set lastTranslated to createdAt time on creation if the user does not want to translate initially
  // translationCanceledAt: { type: Date },
  nLang: {type: String, required: true},
  pLang: {type: String, required: true}
  //Super timestamp: createdAt, updatedAt, lastCodeUpdate
});

/**
 * Validations
 */
// ExplanationSchema.path('plainCodeInput').validate(function(code) {
//   return code && code.length;
// }, 'You must supply some source code.');

ExplanationSchema.plugin(timestamps, {
  createdAt: { index: true },
  updatedAt: { index: true },
  lastCodeUpdate: { index: true, modifyPaths: ["plainCodeInput"] }
});

ExplanationSchema.pre('validate', function (next) {
  if (this.isNew && this.lastTranslated !== null) { // Controller sets to null when the user doesn't want to explain now
    this.lastTranslated = this.createdAt; // To stop the translator translating it
  }
  next();
});

ExplanationSchema.path('saved').validate(function (s) {
  return [ 1, 2 ].indexOf(s) != -1;
}, 'Invalid saved value');

ExplanationSchema.path('saved').validate(function (s) {
  return !(!this.user && (this.saved || this.lastTranslated === null)); // If there is no user but it is saved or they want it to not trasnlate, BAD!
}, 'Cannot save without being signed in!');

ExplanationSchema.path('plainCodeInput').validate(function (c) {
  return c ? (c.length < 2000) : true;
}, 'Input code too large!');

ExplanationSchema.methods.forApi = function() {
  // Selects fields to send back incase private ones are added
  return _.pick(this, [
    "_id",
    "user",
    "pLang",
    "nLang",
    "plainCodeInput",
    "translatorMessages",
    "outputTree",
    "lastTranslated",
    "createdAt",
    "updatedAt",
    // "translationCanceledAt",
    "lastCodeUpdate",
    "saved",
    "title",
    "minExplainSeconds"
  ]);
};

// ExplanationSchema.methods.accessAllowed = function() {
//   var currentTimeMs = new Date().getTime();
//   //        If translated      and     the time (ms) it was updated 
//   return ( exp.lastTranslated ) || ( exp.updatedAt.getTime() + ((exp.minExplainSeconds || 5)*1000) < currentTimeMs )

//   if (lastTranslated is null) {
//     NOPE
//   } else if (lastTranslated isnt null && is the same as updatedAt && ) {
//     NOPE
//   }
// };

ExplanationSchema.statics.allowed = function(requested, instance) {
  // Function which selects the fields which are allowed to be saved from the request object
  var picked = _.pick(requested, [
    "pLang",
    "nLang",
    "plainCodeInput",
    "saved",
    "title"
  ]);
  // This is kinda hackey v
  // return instance ? new mongoose.model('Explanation')(picked) : picked;
  return picked;
};

mongoose.model('Explanation', ExplanationSchema);