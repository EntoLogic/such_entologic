var mongoose = require('mongoose'),
    config = require('../../config/config'),
    Schema = mongoose.Schema,
    timestamps = require('./mongoose_plugins/super_timestamp');

var ExplanationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  plainCodeInput: {type: String, required: true},
  failure: [{errorMessage: String}],
  outputTree: String,
  lastTranslated: { type: Date, index: true },
  nLang: {type: String, required: true},
  pLang: {type: String, required: true}
});

/**
 * Validations
 */
// ExplanationSchema.path('plainCodeInput').validate(function(code) {
//   return code && code.length;
// }, 'You must supply some souce code.');


ExplanationSchema.plugin(timestamps, {
  createdAt: { index: true },
  updatedAt: { index: true },
  lastCodeUpdate: { index: true, modifyPaths: ["plainCodeInput"] }
  // lastTranslated caused by translator and not handled here.
});

mongoose.model('Explanation', ExplanationSchema);