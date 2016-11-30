/* jshint node:true */
'use strict';

var _ = require('lodash');
var _CI = require('../constants').CI;
var createdModifiedPlugin = require('mongoose-createdmodified').createdModifiedPlugin;
var logger = require('../utilities/logger');

module.exports = function(mongoose,conn) {

    var ObjectId = mongoose.Schema.Types.ObjectId;
    var Mixed = mongoose.Schema.Types.Mixed;        

    var BrandSchema = require('./Brand')(mongoose,conn).schema;    

    return {
        descriptor: {
            media_company_id: {
                type: ObjectId
            },
            agency_id: {
                type: ObjectId
            },
            client_id: {
                type: Mixed
            },
            advertiser: {
                type: String
            },
            files_by_brand: {
                type: Boolean
            },
            files_by_program: {
                type: Boolean
            },
            default_ci_type: {
                type: String
            },
            default_ci_type_id: {
                type: ObjectId
            },
            brands: [BrandSchema]
        }
    };
};
