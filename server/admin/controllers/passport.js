/* jshint node:true */
'use strict';
var _ = require('lodash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var constants = require('../admin_constants');
var logger = require('../../utilities/logger');

////////////////////////////////////////////////////////////////////////////////

function augmentUser(user, done, successMessage) {

    var _user = user.toObject();

    return done(null, _user, successMessage);
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

    passport.use(new LocalStrategy(function (username, password, done) {

        db.User
            .findOne({userName: username})
            .exec(function (err, user) {

                if (err) {
                    return done(err, false);
                }

                if (!user) {
                    return done(null, null, "Incorrect username/password, Please try again.");
                }


                /**
                 * william add for admin before getCompany.
                 */
                if (
                    (user.roles.indexOf(constants.USER.ADMIN_ROLES.TB_ADMIN.value) > -1) ||
                    (user.roles.indexOf(constants.USER.ADMIN_ROLES.SUPER_ADMIN.value) > -1) ||
                    (user.roles.indexOf(constants.USER.ADMIN_ROLES.COMPANY_ADMIN.value) > -1)
                ) {
                    if (user && user.authenticate(password)) {

                        return augmentUser(user, done, 'successMessage');
                    }
                    else {

                        logger.error(username + 'User is Unauthorized, Please try again.');

                        return done(null, false, "User is Unauthorized, Please try again.");
                    }
                }
                else {
                    // no error, user is a CC user.
                    return done(null, false, "Not an admin user. Please try again.");
                }
            });
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
                return augmentUser(user, done);
            })
            .catch(function (err) {

                logger.error('deserializeUser');
                return done(null, false);
            });

    });
}
