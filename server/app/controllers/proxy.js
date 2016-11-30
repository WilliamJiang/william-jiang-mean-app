/* jshint node:true */
'use strict';

/**
 * william:
 * 1. refer to mediaCompanyIngest.js
 * 2. use request.js as proxy. (option: express-http-proxy).
 */
var request = require('request');
var logger = require('../../utilities/logger');

////////////////////////////////////////////////////////////////////////////////

module.exports = function (app) {

    var config = app.locals.config;

    var tb = {
        // For now, we pass the NODE_ENV as a path param to the backend system
        // so that it can target the correct database and aws settings
        url: config.TBPROCESSING_URL + '/api/v1/media_company/manual_ingest/' + process.env.NODE_ENV,
        method: 'POST'
    };

    function ingest(req, res) {
        /**
         * william assembly the post data.
         * 1. The login user info is in req.user object, implemented by passport 'local' strategy.
         * 2. the uploaded data info is in file-upload form
         * 3. s3 bucket info also needed.
         */
        var passData = {
            user: {
                userName: req.user.userName, //created_by
                //fullName: req.user.lastName + ", " + req.user.firstName,
                network: req.user.affiliation.metadata.active_network
            },
            data: {
                bucket: req.body.bucket,
                location: req.body.location,
                name: req.body.name,
                key: req.body.key
            }
        };

        logger.debug(passData,'passData');

        var requestOptions = {
            url: tb.url,
            method: tb.method,
            json: passData
        };

        logger.debug(requestOptions,'requestOptions');

        request(requestOptions,
                function (error, httpResponse, body) {

                    logger.debug(error,'manual_ingest::error');
                    logger.debug(httpResponse,'manual_ingest::httpResponse');

                }).pipe(res);
    }

    return {
        ingest: ingest
    }
};
