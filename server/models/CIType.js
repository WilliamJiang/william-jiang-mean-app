/* jshint node:true */
'use strict';

var logger = require('../utilities/logger');

module.exports = function (mongoose, conn) {

    var ObjectId = mongoose.Schema.Types.ObjectId;
    var Mixed = mongoose.Schema.Types.Mixed;
    
    return {
        descriptor: {
            media_company_id: {
                type: ObjectId
            },
            label: {
                type: String
            },
            value: {
                type: String
            },
	    aliases: [
		String // Used for UCR matching
	    ], 
            client_id: {
                type: Mixed
            }
        }
    };
};
