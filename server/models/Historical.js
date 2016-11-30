/* jshint node:true */
'use strict';

var logger = require('../utilities/logger');

module.exports = function(mongoose,conn) {

    var ObjectId = mongoose.Schema.Types.ObjectId;
    var Mixed = mongoose.Schema.Types.Mixed;

    return {
        descriptor: {        	
			ts: {type: Date, default: new Date()},
			coll: {type: String},
			action: {type: String},
			user: {type: String},
            network: {type: String},
			doc: {}
        }
    };
};
