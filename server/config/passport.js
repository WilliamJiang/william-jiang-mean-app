/* jshint node:true */
'use strict';
var _ = require('lodash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var constants = require('../constants');
var _COMPANY = constants.COMPANY;
var logger = require('../utilities/logger');

////////////////////////////////////////////////////////////////////////////////

var dataaccessgroupCtrl = null;
var MAX_ALLOWED_UNSUC_ATT = 5;
var MAX_DAYS_PWD_VALID = 30;
var PWD_CHANGE_ALERT_DAYS = 10;
var USR_PWD_INVALID_MSG = constants.AUTH.MSG.USR_PWD_INVALID;
var USR_UNAUTHORIZED = constants.AUTH.MSG.USR_UNAUTHORIZED;
var USR_ACC_LOCKED = constants.AUTH.MSG.USR_ACC_LOCKED;

function isAuthorizedUser(user) {

    return user && user.roles &&
        ((user.roles.indexOf(constants.USER.ROLES.MEDIA_COMPANY.USER) > -1) || (user.roles.indexOf(constants.USER.ROLES.AGENCY.USER) > -1))

}

function assignAccessibleNetworks(user, callback) {
    dataaccessgroupCtrl.getAccessibleNetworks(user).then(function (accessibleNetworks) {
        var isAuthorized = isAuthorizedUser(user) && accessibleNetworks && accessibleNetworks.length > 0;
        if (isAuthorized) {
            accessibleNetworks.sort();
            user.accessibleNetworks = accessibleNetworks;
            if (user.affiliation.metadata && user.affiliation.metadata.active_network) {
                if (accessibleNetworks.indexOf(user.affiliation.metadata.active_network) === -1) {
                    user.affiliation.metadata.active_network = accessibleNetworks[0];
                }
            } else {
                if (!user.affiliation.metadata) {
                    user.affiliation.metadata = {};
                }
                if (!user.affiliation.metadata.active_network) {
                    user.affiliation.metadata.active_network = accessibleNetworks[0];
                }
            }
        }

        return callback(isAuthorized);
    });
}

////////////////////////////////////////////////////////////////////////////////

function getCompany(db, user) {

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

function augmentUser(company, user, done, successMessage) {
    //logger.debug(company,'company');
    
    user.removeConfidentialData();
//    company.removeConfidentialData();
    
    var _user = user.toObject();
    _user.affiliation.company = company;

    if (user.affiliation.type === _COMPANY.TYPE.MEDIA_COMPANY) {
        assignAccessibleNetworks(_user, function (isAuthorized) {
            if (isAuthorized) {
                return done(null, _user, successMessage);
            } else {
                logger.error(USR_UNAUTHORIZED);
                return done(null, false, USR_UNAUTHORIZED);
            }

        })
    } else {
        return done(null, _user, successMessage);
    }
}


function handleLoginAttempt(user, success, callback) {
    if (success) {
        user.unsuccessfulLoginAttempts = 0;
    } else {
        user.unsuccessfulLoginAttempts++;
    }

    user.saveAsync().then(function () {
        return callback(user);
    });

}

module.exports = function (app) {

    var db = app.locals.db;

    dataaccessgroupCtrl = require('../app/controllers/dataaccessgroup')(app);

    passport.use(new LocalStrategy(function (username, password, done) {

        //logger.debug(username,'username');
        //logger.debug(password,'password');

        db.User
            .findOne({userName: username})
            .exec(function (err, user) {

                if (err) {
                    return done(err, false);
                }

                if (!user) {
                    return done(null, false, USR_PWD_INVALID_MSG);
                }

                getCompany(db, user).then(function (company) {

                    var maxAllowedUnsuccessfulAttempts = company.config.maxAllowedUnsuccessfulAttempts || MAX_ALLOWED_UNSUC_ATT;
                    var maxDaysPasswordValid = company.config.maxDaysPasswordValid || MAX_DAYS_PWD_VALID;

                    if (user.isTerminated()) {
                        return done(null, false, USR_PWD_INVALID_MSG);
                    }

                    if (!user.isValidLoginAttempt(maxAllowedUnsuccessfulAttempts)) {
                        return done(null, false, USR_ACC_LOCKED);
                    }

                    //logger.debug(user,'user');

                    if (user && user.authenticate(password)) {

                        if (user.isPasswordExpired(maxDaysPasswordValid)) {
                            return done(null, false, "Password Expired. Please contact your company Trafficbridge administrator.");
                        }
                        var noOfDaysPasswordValid = user.noOfDaysPasswordValid(maxDaysPasswordValid),
                            successMessage = null;

                        if (noOfDaysPasswordValid <= PWD_CHANGE_ALERT_DAYS) {
                            successMessage = "Your Password will expire in " + noOfDaysPasswordValid + " day(s). Click <a href='/profile'>here</a> to change it now.\n";
                        }

                        //logger.debug(username + ' user found!');
                        handleLoginAttempt(user, true, function () {
                            return augmentUser(company, user, done, successMessage);
                        });

                    }
                    else {
                        logger.error(username + USR_PWD_INVALID_MSG);
                        handleLoginAttempt(user, false, function (_user) {
                            var remainingAttempts = maxAllowedUnsuccessfulAttempts - (_user.unsuccessfulLoginAttempts);

                            if (remainingAttempts === 0) {
                                return done(null, false, USR_ACC_LOCKED);
                            }
                            else if (remainingAttempts < 3) {
                                return done(null, false, USR_PWD_INVALID_MSG+"\n Remaing attempts: " + remainingAttempts);
                            } else {
                                return done(null, false, USR_PWD_INVALID_MSG);
                            }

                        })
                    }

                }).catch(function (err) {
                    logger.error(err, 'error');
                })

            })
    }));

    passport.serializeUser(function (user, done) {

        if (user) {
            done(null, user._id);
        }
    });

    passport.deserializeUser(function (id, done) {

        db.User
            .findOneAsync({_id: id}, '-salt -hashed_password')
            .then(function (user) {
            	if(user.isTerminated()){
            		return done(null, false, USR_UNAUTHORIZED);
            	}
                getCompany(db, user).then(function (company) {
                    return augmentUser(company, user, done);
                });
            })
            .catch(function (err) {

                logger.error('deserializeUser');
                return done(null, false);
            });

    });
}
