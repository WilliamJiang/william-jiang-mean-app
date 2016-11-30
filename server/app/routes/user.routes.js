/* jshint node:true */
'use strict';

var auth = require('../../config/auth');

module.exports = function (app) {

    var userCtrl = require('../controllers/users')(app);

    app.route('/api/users')
        .get(auth.requiresRole('admin'), userCtrl.getUsers);

    app.route('/api/users')
        .post(userCtrl.createUser);

    app.route('/api/users')
        .put(userCtrl.updateUser);

    app.route('/api/users/active_network')
        .put(userCtrl.setActiveNetwork);

};
