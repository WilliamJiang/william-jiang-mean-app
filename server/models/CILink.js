/* jshint node:true */

module.exports = function (mongoose,conn) {
    
    'use strict';
    
    return {
        descriptor: {
            annotationId: {
                type: String,
                required: true
            },
            ciId: {
                type: String,
                required: true
            },
            network: {
                type: String
            },
            ciPageNum: {
            	type: Number
            },
            createdUser: {type: String},
            // TTL index created. Expire after 30 days
            createdDate: {type: Date, index: { expireAfterSeconds: 2592000 } }
        }
    };
};
