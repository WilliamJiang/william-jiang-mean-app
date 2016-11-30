/* jshint node:true */
'use strict';

var _ = require('lodash');
var passport = require('passport');
var logger = require('../../utilities/logger');
var constants = require('../../constants');
var _COMPANY = constants.COMPANY;

////////////////////////////////////////////////////////////////////////////////

module.exports = function (app) {
    var db = app.locals.db;
    var usersCtrl = require('./user')(app);
    var getUserForCredentials = usersCtrl.getUserForCredentials;
    var updateUserPassword = usersCtrl.updateUserPassword;

    function login(req, res, next) {

        logger.debug('login');

        req.body.username = req.body.username.toLowerCase();

        var auth = passport.authenticate('local', function (err, user, authMessage) {

            if (err) {
                return next(err);
            }

            if (!user) {
                res.send({success: false, message: authMessage});
            }

            req.logIn(user, function (err) {

                if (err) {
                    return next(err);
                }

                getCompany(user).then(function (company) {

                    //william TODO: filter data before send:
                    user.affiliation.company = company;
                    res.send({
                        success: true,
                        user: user,
                        message: authMessage
                    });

                });
            });
        });

        auth(req, res, next);
    }

    function logout(req, res) {
        req.logout();
        req.session.destroy();
        res.end();
    }

    function getCompany(user) {

        var _Agency = db.Agency;
        var _MediaCompany = db.MediaCompany;

        if (user.affiliation.type === _COMPANY.TYPE.AGENCY) {

            return _Agency
                .findOneAsync({_id: user.affiliation.ref_id});
        }
        else if (user.affiliation.type === _COMPANY.TYPE.MEDIA_COMPANY) {

            return _MediaCompany
                .findOneAsync({_id: user.affiliation.ref_id});
        }
    }

    return {
        login: login,
        logout: logout
    };
};
