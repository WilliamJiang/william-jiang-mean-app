/* jshint node:true */
'use strict';


module.exports = function(app) {

    /**
     * william
     * mediaCompanyIngest move from bridge to tbprocessing.
     * var mediaCompanyIngestCtrl = require('../controllers/mediaCompanyIngest')(app);
     */
    var proxyCtrl = require('../controllers/proxy')(app);

    app.route('/api/media_company/manual_ingest')
        .post(proxyCtrl.ingest);

};
