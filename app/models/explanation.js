var mongoose = require('mongoose'),
    config = require('../../config/config'),
    Schema = mongoose.Schema,
    timestamps = require('mongoose-timestamp');

// outputTree schema (must be 'mixed' type in mongoose)

// NODE ->
// 	node: String,
// 	clauses: String or Node or Annotation,
// 	location: {start: [line, col], end: [line, col]}

// future addition
// ANNOTATION ->
// 	type: String,
// 	content: String


var ExplanationSchema = new Schema({
	plainCodeInput: {type: String, required: true},
	failure: [{errorMessage: String}],
	outputTree: Schema.Types.Mixed,
	lastTranslated: Date,
	nLang: {type: String, required: true},
	pLang: {type: String, required: true}
});

/**
 * Validations
 */
ExplanationSchema.path('plainCodeInput').validate(function(code) {
  return code && code.length;
}, 'You must supply some souce code.');

ExplanationSchema.plugin(timestamps);

mongoose.model('Explanation', ExplanationSchema);