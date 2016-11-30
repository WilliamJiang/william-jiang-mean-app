/* jshint node:true */
'use strict';

var fs = require('fs');
var _ = require('lodash');
//var historyPlugin = require('mongoose-history');
var historicalPlugin = require('historical');
var revisionPlugin = require('mongoose-hook-revision');
var mergePlugin = require('../mongoose-plugins/merge');
var createdModifiedPlugin = require('../mongoose-plugins/mongoose-createdmodified').createdModifiedPlugin;
var customQueryPlugin = require('../mongoose-plugins/CustomQuery');
var historyPlugin = require('../mongoose-plugins/History');
var logger = require('../utilities/logger');

module.exports = function(mongoose,conn,modelsPath) {

    var db = {};

    logger.debug(modelsPath,'modelsPath');

    fs.readdirSync(modelsPath).forEach(function(filename) {

        //logger.debug(filename,'filename');

        if (filename.match(/\.js$/)) {

            var modelName = filename.replace('.js', '');
            var obj = require(modelsPath + '/' + filename)(mongoose,conn);

            //logger.debug(obj.schema_only,'obj.schema_only');	    

            if (!obj.schema_only) {

                logger.debug(filename,'filename');

                var schema = mongoose.Schema(obj.descriptor,
                    obj.options);

                if (obj.virtuals) {
                    _.forEach(obj.virtuals,function(v,k) {
                        schema.virtual(k).get(v);
                    });
                }

                if (obj.extras) {
                    obj.extras(schema);
                }
                schema.plugin(revisionPlugin, {mongoose: mongoose, path: "__docVersion"});
                schema.plugin(customQueryPlugin);
                schema.plugin(historyPlugin, {connection: conn, collectionName: "historicals"});

                if (modelName !== 'Annotation') {

                    schema.plugin(mergePlugin);

                    schema.plugin(createdModifiedPlugin,
                        {
                            createdName: 'created_at',
                            modifiedName: 'updated_at',
                            index: true
                        });

                    if (modelName === 'CI') {
                        //schema.plugin(historyPlugin);
                        //schema.plugin(historicalPlugin);
                    }

                    //this is to ensure unique constraint on a user_id & search_name combination!
                    if (modelName === 'SavedSearch') {
                        schema.index({"name": 1, "user_id": 1}, {unique: true});
                    }
                }

                db[modelName] = conn.model(modelName,schema);

                //logger.debug(db,'db');
                //logger.debug(modelName,'modelName');
            }
        }
    });

    var bluebird = require('bluebird');
    bluebird.longStackTraces();

    require('mongoomise').promisifyAll(mongoose,bluebird);
    require('mongoomise').promisifyAll(conn,bluebird);

    return db;
};
