/*jslint node: true */
'use strict';

var express = require('express');
var mongoose = require('mongoose');
var _ = require('lodash');
var config = require('./server/admin/admin_config');
var logger = require('./server/utilities/logger');

logger.debug(config,'config');

////////////////////////////////////////////////////////////////////////////////

var db = {};

var app = express();

mongoose.connect(config.db.mongo.app.uri,
		 config.db.mongo.app.options);

var conn = mongoose.connection;

conn.once('open',function callback() {

    logger.debug('Database connection opened');

    var modelsPath = __dirname + '/server/models';

    db = require('./server/config/mongoose')(mongoose,conn,modelsPath);
    require('./server/admin/admin_express')(config,app,db);

    app.get('/', function(req, res) {
        res.status(200).send('admin spa application.');
    });

    app.listen(config.port);

    logger.debug('Server is ready, listening to Port: ' + config.port);
});

conn.on('error',function(error) {
    logger.error('Database connection error: ' + error);
});
