/* jshint node:true */
'use strict';

module.exports = function (app) {

    var authCtrl = require('../controllers/auth')(app);

    app.route('/login').post(authCtrl.login);
    app.route('/logout').post(authCtrl.logout);
    //app.route('/forgot/:credential').post(authCtrl.forgotCredentials);
};
