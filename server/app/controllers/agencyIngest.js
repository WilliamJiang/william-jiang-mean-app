/* jshint node:true */
'use strict';

var _ = require('lodash');
var constants = require('../../constants');
var _INGEST = constants.INGEST;
var _CI = constants.CI;
var logger = require('../../utilities/logger');

////////////////////////////////////////////////////////////////////////////////

module.exports = function(app) {

    ////
    var db = app.locals.db;
    ////
    var CI = db.CI;
    var Ingest = db.Ingest;    
    ////
    
    function createIngestFromUploadData(user,uploadData) {

        var metadata = uploadData.metadata;

        return {
            method: _INGEST.METHOD.MANUAL,
            source: _INGEST.SOURCE.AGENCY,
            sender: user.affiliation.ref_id,
            status: _CI.STATUS.DELIVERED,
            metadata: metadata,
            files: {
                original: {
                    file_type: 'application/pdf',
                    url: uploadData.location
                },
                common: {
                    file_type: 'application/pdf',
                    url: uploadData.location
                }
            },
            created_by: user.userName
        };
    }

    function createCIFromIngest(user,_ingest) {

        var ingest = _.omit(_ingest.toObject(),[ '_id','__v' ]);
        logger.debug(ingest,'ingest');

        var ci = {
            network: ingest.metadata.network,
            ingest : ingest,
            status: _CI.STATUS.DELIVERED,
            air_date_start: ingest.metadata.air_date_start,
            air_date_end: ingest.metadata.air_date_end,
            created_by: ingest.created_by,//user._id,
            // Compatibility
            method: ingest.method,
            source: ingest.source,
            sender: ingest.sender,
            files: {
                original: {
                    file_type: ingest.files.original.file_type,
                    url: ingest.files.original.url
                },
                common: {
                    file_type: ingest.files.original.file_type,
                    url: ingest.files.common.url
                }
            }
        };

        logger.debug(ci,'ci');

        return ci;
    }

    ////////////////////////////////////////////////////////////////////////////////

    function startPostUpload(req,res) {

        var uploadData = req.body;
        //logger.debug(uploadData,'uploadData');

        var created_by = req.user._id;

        var ingest = createIngestFromUploadData(req.user, uploadData);

        var __ingest;

        Ingest
            .createAsync(ingest)
            .then(function (_ingest) {

                __ingest = _ingest;

                logger.debug(_ingest,'ingest created');

                var ci = createCIFromIngest(req.user,__ingest);

                return CI.createAsync(ci);
            })
            .then(function (_ci) {

                //logger.debug(_ci,'ci created');

                return res.send(200, {
                    ingest_id: __ingest._id,
                    ci_id: _ci.id,
                    key: uploadData.key
                });
            })
            .catch(function(error) {
                logger.error(error,'error');
                return res.status(500).send({ error: error.toString() });
            });
    }

    return {
        startPostUpload: startPostUpload
    };
};
