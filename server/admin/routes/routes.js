/* jshint node:true */

'use strict';

var logger = require('../../utilities/logger');

module.exports = function (app) {

    var constants = require('../admin_constants');

    var config = app.locals.config;

    function isAuthorized(req, res) {

        return req.user && req.user.roles &&
            ((req.user.roles.indexOf(constants.USER.ADMIN_ROLES.TB_ADMIN.value) > -1) ||
            (req.user.roles.indexOf(constants.USER.ADMIN_ROLES.SUPER_ADMIN.value) > -1) ||
            (req.user.roles.indexOf(constants.USER.ADMIN_ROLES.COMPANY_ADMIN.value) > -1));
    }

    app.get('/api/admin/admin_config', function (req, res) {
        if (!constants) {
            var constants = require('../admin_constants');
        }
        res.send(constants);
    });


    app.use('/api/admin/v1', function (req, res, next) {

        if (!req.isAuthenticated()) {
            return res.send(401, 'User Authenticated.');
        }
        if (!isAuthorized(req, res)) {
            return res.send(403, 'User Unauthorized.');
        }
        return next();
    });

    require('./auth.routes.js')(app);
    require('./admin.routes.js')(app);

    app.get('*', function (req, res) {

        res.render('index');
    });
};
