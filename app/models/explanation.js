var mongoose = require('mongoose'),
    config = require('../../config/config'),
    Schema = mongoose.Schema,
    timestamps = require('mongoose-timestamp');

var ExplanationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  plainCodeInput: {type: String, required: true},
  failure: [{errorMessage: String}],
  outputTree: String,
  lastTranslated: Date,
  nLang: {type: String, required: true},
  pLang: {type: String, required: true}
});

/**
 * Validations
 */
// ExplanationSchema.path('plainCodeInput').validate(function(code) {
//   return code && code.length;
// }, 'You must supply some souce code.');

ExplanationSchema.plugin(timestamps);

mongoose.model('Explanation', ExplanationSchema);