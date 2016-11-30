/* jshint node:true */
'use strict';

var constants = require('../../constants');

module.exports = function (app) {

    var config = app.locals.config;

    app.get('/api/config', function (req, res) {

        // HACK kenmc
        constants.S3_INGEST_URL = 'https://' + config.aws.bucket.ingest + '.s3.amazonaws.com/';
        constants.S3_IMPORT_UCR_URL = 'https://' + config.aws.bucket.ucr + '.s3.amazonaws.com/';

        res.send(constants);
    });   
};
