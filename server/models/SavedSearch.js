/* jshint node:true */
'use strict';

var _ = require('lodash');
var _CI = require('../constants').CI;
var logger = require('../utilities/logger');

module.exports = function (mongoose,conn) {

    var ObjectId = mongoose.Schema.Types.ObjectId;
    
    return {
        descriptor: {
            user_id: {
                type: ObjectId
            },
            name: {
                type: String
            },
            search_id: {
                type: String
            },
            query: {
                air_date_start: {
                    type: Date
                },
                air_date_end: {
                    type: Date
                },
                advertisers: [{
                    name: String,
                    value: String
                }],
                brands: [{
                    name: String,
                    value: String
                }],
                programs: [{
                    name: String,
                    value: String
                }],
                statuses: [{
                    name: String,
                    value: {
                        type: String,
                        "enum": _.values(_CI.STATUS)
                    }
                }],
                types: [{
                    name: String,
                    value: {
                        type: String//,
                        //"enum": _.values(_CI.TYPE)
                    }
                }],
                owners: [{
                    name: String,
                    value: String
                }],
                conditions: [{
                    name: String,
                    value: {
                        type: String,
                        "enum": _.values(_CI.CONDITION)
                    }
                }],
                sort: {
                    name: String,
                    value: {
                        type: Number
                    }
                }
            }
        }
    };
};
