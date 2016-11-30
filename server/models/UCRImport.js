/* jshint node:true */
'use strict';

var logger = require('../utilities/logger');

module.exports = function(mongoose,conn) {

    var ObjectId = mongoose.Schema.Types.ObjectId;
    
    return {
        descriptor: {
            url: {
                type: String
            },
	    media_company_id: {
		type: ObjectId
	    },	    
	    /*
	    network: {
		type: String
	    },
	    */
            imported_by: {
                type: String //ObjectId,
            }
        }
    };
};
