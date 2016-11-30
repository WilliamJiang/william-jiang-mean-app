/* jshint node:true */
'use strict';

var AWS = require('aws-sdk');
var crypto = require('crypto');
var logger = require('../../utilities/logger');

////////////////////////////////////////////////////////////////////////////////

module.exports = function(app) {

    var config = app.locals.config;

    function getExpiryTime() {

        var _date = new Date();
        return '' + (_date.getFullYear()) + '-' + (_date.getMonth() + 1) + '-' + (_date.getDate() + 1) + 'T' + (_date.getHours() + 3) + ':' + '00:00.000Z';
    }

    function createIngestS3Policy(contentType,callback) {

        var s3Policy = {
            'expiration': getExpiryTime(),
            'conditions': [
                [ 'starts-with', '$key', '' ],
                { 'bucket': config.aws.bucket.ingest },
                { 'acl': 'public-read' },
                [ 'starts-with', '$Content-Type', contentType ],
                { 'success_action_status' : '201' }
            ]
        };

        createS3Policy(s3Policy,callback);
    }

    function createImportUCRS3Policy(contentType,callback) {

        var s3Policy = {
            'expiration': getExpiryTime(),
            'conditions': [
                [ 'starts-with', '$key', '' ],
                { 'bucket': config.aws.bucket.ucr },
                { 'acl': 'public-read' },
                [ 'starts-with', '$Content-Type', contentType ],
                { 'success_action_status' : '201' }
            ]
        };

        createS3Policy(s3Policy,callback);
    }

    function createS3Policy(s3Policy,callback) {

        // stringify and encode the policy
        var stringPolicy = JSON.stringify(s3Policy);

        logger.debug(stringPolicy);

        var base64Policy = new Buffer(stringPolicy, 'utf-8').toString('base64');

        // sign the base64 encoded policy
        var signature = crypto
            .createHmac('sha1', config.aws.secretAccessKey)
            .update(new Buffer(base64Policy, 'utf-8'))
            .digest('base64');

        // build the results object
        var s3Credentials = {
            s3Policy: base64Policy,
            s3Signature: signature,
            AWSAccessKeyId: config.aws.accessKeyId
        };

        // send it back
        callback(s3Credentials);
    };

    function getIngestS3Policy(req,res) {

        createIngestS3Policy(req.query.mimeType,function(creds,err) {

            if (!err) {
                return res.send(200,creds);
            }
            else {
                return res.send(500,err);
            }
        });
    }

    function getImportUCRS3Policy(req,res) {

        createImportUCRS3Policy(req.query.mimeType,function(creds,err) {

            if (!err) {
                return res.send(200,creds);
            }
            else {
                return res.send(500,err);
            }
        });
    }

    return {
        getIngestS3Policy: getIngestS3Policy,
        getImportUCRS3Policy: getImportUCRS3Policy
    };
};
