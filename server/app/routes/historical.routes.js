/* jshint node:true */
'use strict';

module.exports = function (app) {

    var historicalCtrl = require('../controllers/historical')(app);

    app.route('/api/historical/:id')
        .get(historicalCtrl.get);

};
