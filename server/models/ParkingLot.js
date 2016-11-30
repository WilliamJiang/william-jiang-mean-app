/* jshint node:true */
'use strict';

var logger = require('../utilities/logger');

module.exports = function(mongoose,conn) {

    var ObjectId = mongoose.Schema.Types.ObjectId;
    
    return {
        descriptor: {
            user_id: {
		type: ObjectId
	    },
            cis: [ ObjectId ]
        }
    };
};
