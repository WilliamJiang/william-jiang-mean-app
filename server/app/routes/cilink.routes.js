/* jshint node:true */
'use strict';

module.exports = function (app) {

    var ciLinkCtrl = require('../controllers/cilink')(app);

    app.route('/api/cilink/:id')
        .get(ciLinkCtrl.get);

    app.route('/api/cilink/create')
        .post(ciLinkCtrl.save);

};
