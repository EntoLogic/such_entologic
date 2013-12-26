// SuperTimestamp plugin
// Copyright(c) 2014 Rory Hughes

// HOW TO USE:
// Pass in through options an object with the keys set to the names of the timestamps you want to add.
// The values should be objects with an optional 'index' value set to true if you want to index by the timestamp and
// an array named 'modifyPaths' which contains a list of the schemas paths that, when any are modified, will update the timestamp.
// 'createdAt' and 'updatedAt' are built in so you only need to add the index boolean to them (if required).
// Other timestamps will not work as modify paths.

// EXAMPLE
// var superTimestamp = require(<plugin location string>);
// var ThingSchema = new Schema({ ... });
// ThingSchema.plugin(superTimestamp, {
// 	 updatedAt: { index: true },
// 	 createdAt: { index: true },
// 	 lastPasswordChange: { modifyPaths: ["passwordHash"], index: true },
// 	 lastAddressUpdate: { modifyPaths: ["street", "city", "postcode", "country"] }
// });

var _ = require("underscore");	

function superTimestamp(schema, timestamps) {
	var pathsToAdd = {};
	_.each(timestamps, function(options, timestampName) {
		pathsToAdd[timestampName] = {type: Date, index: options.index};
	});
	schema.add(pathsToAdd);

  schema.pre('save', function (next) {
  	var t = this;
  	var ct = new Date;
  	var modifiedPaths = t.modifiedPaths();
  	if (schema.paths.updatedAt && modifiedPaths.length) {
  		t.updatedAt = ct;
  	};
  	if (schema.paths.createdAt && t.isNew) {
  		t.createdAt = ct;
  	}
  	console.log(modifiedPaths);
  	_.each(_.omit(timestamps, "createdAt", "updatedAt"), function(options, timestampName) {
  		if (_.intersection(modifiedPaths, options.modifyPaths).length) {
  			t[timestampName] = ct;
  			console.log(t.updatedAt);
  		}
  	});

    next();
  });
};

module.exports = superTimestamp;

// IDEAS
// Allow for customisation of updatedAt and createdAt
// Timestamp lists: Push current time to a list of timestamps
// Add counter feature which increases a counter on modification of 