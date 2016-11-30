/* jshint node:true */
'use strict';

var _ = require('lodash');
var _CI = require('../constants').CI;
var _INGEST = require('../constants').INGEST;
var logger = require('../utilities/logger');

module.exports = function (mongoose,conn) {

    var ObjectId = mongoose.Schema.Types.ObjectId;
    var Mixed = mongoose.Schema.Types.Mixed;    
    
    return {
	options: {
	    minimize: false
	},
        descriptor: {
            method: {
                type: String
            },
            source: {
                type: String
            },
	    identifier: {
		type: String
	    },	    
	    recipient: {
		type: String
	    },
            sender: {
                type: String
            },	    	    
            subject: {
                type: String
            },
            status: {
                type: String,
		"enum": _.values(_INGEST.STATUS) 
            },
	    reason: {
		type: String
	    },
            created_by: {
                type: String //ObjectId,
            },
            metadata: {
		agency: {
		    type: String
		},
		contact: {
		},
                network: {
                    type: String
                },
                advertiser: {
                    type: String
                },
		advertiser_code: {
                    type: Mixed
		},
                brand: {
                    type: String
                },
		brand_code: {
                    type: Mixed
		},		
                program: {
                    type: String
                },
		program_code: {
                    type: Mixed
		},		
                type: {
                    type: String
                },		
                air_date_start: {
                    type: Date
                },
                air_date_end: {
                    type: Date
                }
            },
            files: {
                original: {
                    file_type: String,
		    //doc_type: String,
                    url: String
                },
                common: {
                    file_type: String,
                    url: String
                },
                email: {
                    file_type: String,
                    url: String
                },
                image: {
                    sm: {
                        file_type: String,
                        url: String
                    },
                    med: {
                        file_type: String,
                        url: String
                    },
                    full: {
                        file_type: String,
                        url: String
                    }
                }

            }
        }
    };
};
