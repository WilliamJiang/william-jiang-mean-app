/* jshint node:true */
'use strict';

var _ = require('lodash');
var passport = require('passport');
var logger = require('../../utilities/logger');
var pwdutils = require('../../utilities/pwdutils');
var mailer = require('../../utilities/mailer');
var constants = require('../../constants');
var _COMPANY = constants.COMPANY;

////////////////////////////////////////////////////////////////////////////////
var USR_PWD_INVALID_MSG = constants.AUTH.MSG.USR_PWD_INVALID;
var USR_UNAUTHORIZED = constants.AUTH.MSG.USR_UNAUTHORIZED;
var USR_ACC_LOCKED = constants.AUTH.MSG.USR_ACC_LOCKED;

module.exports = function (app) {
    var db = app.locals.db;
    var usersCtrl = require('./users')(app);
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

                // william add automated timeout, first-time when login.
                app.locals.automated_timeout = new Date();

                res.send({
                    success: true,
                    user: user,
                    message: authMessage
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

        var _Agency = db.Agency;//conn.model('Agency');
        var _MediaCompany = db.MediaCompany;//conn.model('MediaCompany');

        //logger.debug(user.affiliation.type,'user.affiliation.type');

        if (user.affiliation.type === _COMPANY.TYPE.AGENCY) {

            return _Agency
                .findOneAsync({_id: user.affiliation.ref_id});
        }
        else if (user.affiliation.type === _COMPANY.TYPE.MEDIA_COMPANY) {

            //logger.debug(user.affiliation.type,'user.affiliation.type');
            //logger.debug(user.affiliation.ref_id,'user.affiliation.ref_id');

            return _MediaCompany
                .findOneAsync({_id: user.affiliation.ref_id});
        }
    }

    function forgotCredentials(req, res, next) {
        var credential = req.params.credential;

        if ((credential !== "username" && credential !== "password") || (credential === "username" && !req.body.email) ||
            (credential === "password" && (!req.body.email || !req.body.userName) )) {
            res.status(403);
            return res.send({
                success: false
            });
        }
        var email = req.body.email.toLowerCase();
        var userName = req.body.userName ? req.body.userName.toLowerCase() : null;
        getUserForCredentials(email, userName)
            .then(function (user) {
                if (!user) {
                    return res.send({
                        success: false,
                        message: "User not found in the system."
                    });
                }

                if (user.isTerminated()) {
                    return res.send({
                        success: false,
                        message: USR_UNAUTHORIZED
                    });
                }

                getCompany(user).then(function (company) {
                    var maxAllowedUnsuccessfulAttempts = company.config.maxAllowedUnsuccessfulAttempts;
                    var maxDaysPasswordValid = company.config.maxDaysPasswordValid;

                    if (!user.isValidLoginAttempt(maxAllowedUnsuccessfulAttempts)) {
                        return res.send({
                            success: false,
                            message: USR_ACC_LOCKED
                        });
                    }

                    if (credential === "username") {
                        mailer.sendNotificationMail(email, "Your Username: " + user.userName, null, function () {
                            return res.send({
                                success: true
                            });
                        })

                    } else if (credential === "password") {
                        if (user.isPasswordExpired(maxDaysPasswordValid)) {
                            return res.send({
                                success: false,
                                message: "Password Expired. Please contact your company Trafficbridge administrator."
                            });
                        }
                        var generatedPassword = pwdutils.generatePassword();
                        updateUserPassword(user, generatedPassword).then(function (obj) {
                            mailer.sendNotificationMail(email, "Your new Password: " + generatedPassword, null, function () {
                                return res.send({
                                    success: true
                                });
                            })
                        })
                    }

                })

            })
            .catch(function (err) {
                res.status(500);
                return res.send({
                    success: false
                });
            })
    }

    return {
        login: login,
        logout: logout,
        forgotCredentials: forgotCredentials
    };
};
