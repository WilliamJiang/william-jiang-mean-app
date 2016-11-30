/* jshint node:true */
'use strict';
var _ = require('lodash');
var logger = require('../../utilities/logger');
var constants = require('../../constants');
var _COMPANY = constants.COMPANY;
var _AUTH = constants.AUTH;
var moment = require('moment');

function isAuthorized(req, res) {

    return req.user && req.user.roles &&
        ((req.user.roles.indexOf(constants.USER.ROLES.MEDIA_COMPANY.USER) > -1) || (req.user.roles.indexOf(constants.USER.ROLES.AGENCY.USER) > -1))
}

function autoLoopApi() {
    return [
        '/api/ci/counts',
        '/api/ci/new',
        '/api/ci/now',
        '/api/ci/parkinglot',
        '/api/ci/revision',
        '/api/ci/stuck',
        '/api/ci/uninstructed'
    ];
}

module.exports = function (app) {
    require('../temp/temp')(app);
    require('./auth.routes.js')(app);
    require('./config.routes.js')(app);

    app.use('/api', function (req, res, next) {

        if (!req.isAuthenticated() || !isAuthorized(req, res)) {
            res.status(401).send('User Unauthorized.');
            return false;
        }

        next();
    });

    app.use('/api', function (req, res, next) {
        var user = req.user;
        if (user.affiliation.type === _COMPANY.TYPE.MEDIA_COMPANY && !req.session.accessibleNetworks) {
            var dataaccessgroupCtrl = require('../controllers/dataaccessgroup')(app);
            dataaccessgroupCtrl.getAccessibleNetworks(req.user).then(function (accessibleNetworks) {
                if (!accessibleNetworks || accessibleNetworks.length === 0) {
                    res.send(401, 'User Unauthorized.');
                    return false;
                }
                req.session.accessibleNetworks = accessibleNetworks;
                next();
            }).catch(function (err) {
                res.status(500).send({error: err.toString()});
                return false;
            });
        } else {
            next();
        }
    });

    app.use('/api', function (req, res, next) {
        var user = req.user,
            currentNetwork = user.affiliation && user.affiliation.metadata && user.affiliation.metadata.active_network ? user.affiliation.metadata.active_network : null;

        if (user.affiliation.type === _COMPANY.TYPE.MEDIA_COMPANY && (!currentNetwork || req.session.accessibleNetworks.indexOf(currentNetwork) === -1)) {
            res.status(403).send('User Unauthorized !');
            return false;
        } else {
            next();
        }
    });

    // william for automated_timeout
    app.use('/api', function (req, res, next) {

        var loginTime = app.locals.automated_timeout || new Date();
        var aryList = autoLoopApi();
        var now = moment();
        var duration = now.diff(moment(loginTime), 'minutes');

        /**
         * TODO: for story #90136990
         * var mc = app.get('media_company_config');
         * console.log('MediaCompanies.config', mc);
         * var automatedTimeout = _AUTH.SESSION_TIME || mc.automatedTimeout;
         */
        if (duration >= _AUTH.SESSION_TIME) {
            res.status(419).send('Session Expired.');
            return false;
        }
        else {
            if (aryList.indexOf(req.originalUrl) === -1) {
                app.locals.automated_timeout = new Date();
            }
            next();
        }
    });

    require('./user.routes.js')(app);
    require('./masterdata.routes.js')(app);
    require('./ci.routes.js')(app);
    require('./annotation.routes.js')(app);
    require('./cilink.routes.js')(app);
    require('./historical.routes.js')(app);
    require('./s3.routes.js')(app);
    require('./comparePDF.routes.js')(app);
    require('./proxy.routes.js')(app);
    require('./test.routes.js')(app);

    app.get('*', function (req, res) {
        var bootstrapUser = req.user;
        res.render('index', {
            bootstrapUser: bootstrapUser
        });
    });
}
