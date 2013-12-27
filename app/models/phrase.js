var mongoose = require('mongoose'),
    config = require('../../config/config'),
    Schema = mongoose.Schema;

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
  nodeName: String,
  pLang: String,
  nLang: String,
  inUse: Boolean,
  voteCache: {type: Number, default: 0},
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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
ClauseSchema.path('words').validate(function(words) {
  return words.length;
}, 'There must be at least one clause.');



// *
//  * Statics
 
// ArticleSchema.statics = {
//   load: function(id, cb) {
//     this.findOne({
//       _id: id
//     }).populate('user', 'name username').exec(cb);
//   }
// };

mongoose.model('Phrase', PhraseSchema);