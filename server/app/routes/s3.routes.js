/* jshint node:true */
'use strict';

module.exports = function (app) {

    var awsCtrl = require('../controllers/aws')(app);
    var agencyIngestCtrl = require('../controllers/agencyIngest')(app);
    var importUCRCtrl = require('../controllers/importUCR')(app);
    var ci = require('../controllers/ci')(app);

    app.route('/api/ingestS3Policy')
        .get(awsCtrl.getIngestS3Policy);

    app.route('/api/importUCRS3Policy')
        .get(awsCtrl.getImportUCRS3Policy);

    app.route('/api/agency/manual_ingest')
        .post(agencyIngestCtrl.startPostUpload);

    app.route('/api/importUCR')
        .post(importUCRCtrl.startPostUpload);

    app.route('/api/ciPrint')
        .post(ci.ciPrint);

    // william:
    app.get('/getVersionInfo', function (req, res) {
        var fs = require('fs');
        fs.createReadStream("./getInfo.txt").pipe(res);
    })
};
