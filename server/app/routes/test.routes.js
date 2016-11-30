/* jshint node:true */
'use strict';

module.exports = function(app) {

    var testCtrl = require('../controllers/test')(app);

    app.get('/api/sendmail',testCtrl.sendMail);
    app.get('/api/xls',testCtrl.generateExcelDoc);                
    app.get('/api/ucr',testCtrl.processUCR);            
};
