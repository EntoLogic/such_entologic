/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    timestamps = require('./mongoose_plugins/super_timestamp'),
    bcrypt = require('bcrypt'),
    _ = require('underscore'),
    async = require("async"),
    Validator = require('validator').Validator,
    val = new Validator(),
    authTypes = ['github', 'twitter', 'google'];

Validator.prototype.error = function(msg) { return false; };

/**
 * User Schema
 */
var UserSchema = new Schema({
  email: {
    type: String,
    unique: true
  },
  username: {
    type: String,
    unique: true
  },
  realName: String,
  provider: String,
  passwordHash: {
    type: String
  },
  twitter: {},
  github: {},
  google: {},
  signInCount: Number
});

var apiSafeFields = {
  me: "-_id email username realName provider",
  randomUser: "-_id username realName"
};
_.each(apiSafeFields, function(value, key, obj) {
  apiSafeFields[key + "Array"] = value.split(" ");
});
var bannedUsernames = ['me'];
var bannedEmails = ['example@example.com'];

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function(password) {
  this._password = password;
  // this.passwordHash = this.encryptPassword(password);
}).get(function() {
  return this._password;
});

/**
 * Validations
 */
var validatePresenceOf = function(value) {
  return value && value.length;
};

// the below 4 validations only apply if you are signing up traditionally
// UserSchema.path('name').validate(function(name) {
//   // if you are authenticating by any of the oauth strategies, don't validate
//   if (authTypes.indexOf(this.provider) !== -1) return true;
//   return name.length;
// }, 'Name cannot be blank');

UserSchema.path('email').validate(function(email) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return email && email.length;
}, 'Email cannot be blank');

UserSchema.path('username').validate(function(username) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return username && username.length;
}, 'Username cannot be blank');

// UserSchema.path('passwordHash').validate(function(passwordHash) {
//   // if you are authenticating by any of the oauth strategies, don't validate
//   if (authTypes.indexOf(this.provider) !== -1) return true;
//   if (!val.check(this.password).len(6, 100)) {
//     this.invalidate('password', 'must be between 6 and 100 characters.');
//   }

//   console.log("WOOP");
//   return true;
// }, 'Password cannot be blank');


/**
 * Pre-save hook
 */
// UserSchema.pre('save', function(next) {
//   if (!this.isNew) return next();

//   if (!validatePresenceOf(this.password) && authTypes.indexOf(this.provider) === -1)
//     next(new Error('Invalid password'));
//   else
//     next();
// });

UserSchema.pre('validate', function(next) {
  var user = this;

  async.parallel([
    function(callback) {
      // Manual uniquness checks
      mongoose.models.User.findOne({$or: [
                                          {email: user.email},
                                          {username: user.username}
                                         ]
                                    },
      function(err, userObj) {
        if(err) {
          callback(err);
        } else if(userObj) {
          if (userObj.email == user.email) {
            user.invalidate("email", "must be unique");
          }
          if (userObj.username == user.username) {
            user.invalidate("username", "must be unique");
          }
          callback();
        } else {
          callback();
        }
      });
    },
    function(callback) {
      // console.log("MODify:", user.isModified('password'));
      // only hash the password if it has been modified (or is new)
      if (!user.password) return callback();
      // generate a salt
      bcrypt.genSalt(11, function(err, salt) {
        if (err) return callback(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
          if (err) return callback(err);

          // override the cleartext password with the hashed one
          user.passwordHash = hash;
          callback();
        });
      });
    },
    function(callback) {
      if (!val.check(user.password).len(6, 100)) {
        user.invalidate('password', 'must be between 6 and 100 characters.');
      }
      callback();
    },
    function(callback) {
      if (user.email in bannedEmails) {
        user.invalidate('email', 'may not be used.');
      }
      if (user.username in bannedUsernames) {
        user.invalidate('username', 'may not be used.');
      }
      callback();
    }
  ],
  function(err, results){
    next();
  });
});

/**
 * Methods
 */
UserSchema.methods = {
  authenticate: function(candidatePassword, cb) {
    return bcrypt.compareSync(candidatePassword, this.passwordHash);
  },
  cleanForApi: function() {
    return _.pick(this, apiSafeFields.randomUserArray);
    // return this.select(apiSafeFields);
  },
  cleanForOwnUser: function() {
    return _.pick(this, apiSafeFields.meArray);
  }
};

UserSchema.static('findForApi', function (q, callback) {
  this.findOne(q, apiSafeFields.randomUser, callback);
});

UserSchema.plugin(timestamps, {
  createdAt: { index: true },
  updatedAt: { index: true },
  lastSignInDate: { index: true, modifiyPaths: ["signInCount"] }
});

mongoose.model('User', UserSchema);