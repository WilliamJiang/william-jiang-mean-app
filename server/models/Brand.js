/* jshint node:true */
'use strict';

var _ = require('lodash');
var _CI = require('../constants').CI;
var createdModifiedPlugin = require('mongoose-createdmodified').createdModifiedPlugin;
var logger = require('../utilities/logger');

module.exports = function(mongoose,conn) {

    var ObjectId = mongoose.Schema.Types.ObjectId;
    var Mixed = mongoose.Schema.Types.Mixed;    

    var BrandSchema = mongoose.Schema({
        name: {
            type: String
        },
        client_id: {
            type: Mixed
        }
    });

    BrandSchema.plugin(createdModifiedPlugin,
                       {
                           createdName: 'created_at',
                           modifiedName: 'updated_at',
                           index: true
                       });

    return {
	schema_only: true,
        schema: BrandSchema
    };
};
