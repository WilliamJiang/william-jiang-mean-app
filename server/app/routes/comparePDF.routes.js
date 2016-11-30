/* jshint node:true */
'use strict';

module.exports = function (app) {

    var comparePDFCtrl = require('../controllers/comparePDF')(app);

    app.route('/api/comparePDF')
        .post(comparePDFCtrl.compare);
};
