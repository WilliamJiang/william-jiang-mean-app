/*jslint node: true */
'use strict';

//APM setup
if (process.env.NODE_ENV || 'development' === 'qa') {
    require('nodetime').profile({
        accountKey: '8b50e30a6e435182aa43e3568102322182117f38',
        appName: 'Traffic Bridge'
    });
}
//APM hooked in for development environment

var express = require('express');
var mongoose = require('mongoose');
//mongoose.set('debug',true);
var _ = require('lodash');
var config = require('./server/app/config');
var logger = require('./server/utilities/logger');

logger.debug(config, 'config');

////////////////////////////////////////////////////////////////////////////////
// Probably a better way to handle this, but for now... kenmc

/*if (!config.TBPROCESSING_URL) {
    throw new Error('Missing required configuration TBPROCESSING_URL');
}

if (!config.REMOTE_COMPARE_SERVICE_URL) {
    throw new Error('Missing required configuration REMOTE_COMPARE_SERVICE_URL');
}*/

////////////////////////////////////////////////////////////////////////////////

var db = {};

var app = express();

var conn = mongoose.createConnection(config.db.mongo.app.uri,
                                     config.db.mongo.app.options);

conn.once('open', function callback() {

    logger.debug('Database connection opened');

    var modelsPath = __dirname + '/server/models';

    db = require('./server/config/mongoose')(mongoose, conn, modelsPath);
    require('./server/app/express')(config, app, db);

    var masterDataCtrl = require('./server/app/controllers/masterdata')(app);

    /**
     * william: this ajax should be updated if you have better solution, current implementation is not good enough by william.
     * pre-load and cache media-company-network data in server-side.
     * app.get('media_company_networks') to fetch the json data.
     */
    masterDataCtrl._getMediaCompanies()
        .bind({})
        .then(function (mediaCompanies) {

            var networks = {};
            // var configs = {};
            mediaCompanies.forEach(function (mc) {
                var name = mc.name.replace(/\s+/g, '_');
                networks[name] = mc.networks.map(function (n) {
                    return n.name;
                });
                //TODO: working with admin in the future.
                //configs[name] = mc.config ? mc.config : {
                //    automatedTimeout: 30
                //}
            });
            app.set('media_company_networks', networks);
            //app.set('media_company_config', configs);
        })
        .catch(function (error) {
            console.log('media_company_networks: ', error.toString());
        });


    app.listen(config.port);

    logger.debug('Server is ready, listening to Port: ' + config.port);
});

conn.on('error', function (error) {
    logger.error('Database connection error: ' + error);
});
