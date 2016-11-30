"use strict";

var R = require('ramda');
var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');
var constants = require('../../constants');
var pwdutils = require('../../utilities/pwdutils');
var encrypt = require('../../utilities/encryption');
var _COMPANY = constants.COMPANY;
var _USER = constants.USER;
var logger = require('../../utilities/logger');
var mailer = require('../../utilities/mailer');

module.exports = function (app) {

    var db = app.locals.db;
    var User = db.User;
    var DataAccessGroup = db.DataAccessGroup;

    var queries = {
        USERS: '_id firstName lastName userName email roles groups affiliation created_at updated_at start_date end_date'
    };

    function getUsers(req, res) {

        var query = {};
        var select = queries.USERS;

        User
            .find(query, select)
            .sort({'updated_at': -1})
            .execAsync()
            .then(function (users) {
                logger.debug(users, 'getUsers: ');

                res.send(users);
            })
            .catch(function (error) {

                logger.error(error, 'Error while getting the users list.');

                return res.send({
                    status: 'ERROR',
                    error: error.toString()
                });
            });
    }

    function getUserById(req, res) {
        var query = {_id: req.params.uid};
        var select = queries.USERS;

        User
            .findOneAsync(query, select)
            .then(function (user) {

                logger.debug(user, 'getUserById: ');

                res.send(user);
            })
            .catch(function (error) {

                logger.error(error, 'Error while getting the user by Id.');

                return res.send({
                    status: 'ERROR',
                    error: error.toString()
                });
            });
    }

    function getUserByName(req, res) {
        var query = {userName: req.params.user_name};
        var select = queries.USERS;

        User
            .findOneAsync(query, select)
            .then(function (user) {

                logger.debug(user, 'getUserByName: ');

                res.send(user);
            })
            .catch(function (error) {

                logger.error(error, 'Error while getting the user by name.');

                return res.send({
                    status: 'ERROR',
                    error: error.toString()
                });
            });
    }

    function createUser(req, res) {
        var payload = req.body;

        //userName & email are always lowercase!
        payload.userName = payload.userName.toLowerCase();
        payload.email = payload.email.toLowerCase();

        //set updated_at
        payload.updated_at = new moment();

        //password creation logic
        var _password = pwdutils.generatePassword();
        payload.salt = encrypt.createSalt();
        payload.hashed_pwd = encrypt.HashPasword(payload.salt, _password);

        return User
            .createAsync(payload)
            .then(function (user) {
                logger.debug(user, 'createUser');

                //update userName in dataaccessgroups Collection also, for Security!
                return _updateDataAccessGroups(payload.groups, payload.userName)
                    .then(function(promises) {
                        //send the welcome email for the user
                        _sendWelcomeEmail(user, _password);
                        //return the user
                        res.send(user);
                    })
                    .catch(function (error) {
                        logger.error(error, 'Error while updating data access groups for the user.');
                        return res.send({
                            status: 'ERROR',
                            error: error.toString()
                        });
                    });

                //send an email to the user with the new password.
                /*mailer.sendNotificationMail(email, "Your new Password: " + _password, null, function(){
                    res.send(user);
                });*/
            })
            .catch(function (error) {
                if(error.code === 11000) {
                    error = new Error('Duplicate Username.');
                    return res.status(500).send({reason: error.toString()});
                }

                logger.error(error, 'ERROR: while creating the User ');
                return res.status(500).send({reason: error.toString()});
            });

    }

    function _updateDataAccessGroups(newGroups, userName) {
        var promises = [];

        //remove the userName from all the groups first!
        promises.push(DataAccessGroup
                .update({}, {
                    $pull: {users: userName} //remove the UserName if it's there already!
                }, {multi: true})
        );

        //now add to New Groups
        _.forEach(newGroups, function (_groupId) {

            promises.push(DataAccessGroup
                    .findOneAndUpdate({_id: _groupId},
                    {
                        $addToSet: {users: userName}
                    })
            );
        });

        logger.debug(promises, 'promises for _updateDataAccessGroups');

        return Promise.all(promises);
    }
    function _sendWelcomeEmail(user, password) {

        var text = '';
        text += 'Dear ' + user.firstName + ' ' + user.lastName + ',';
        text += "<br/>";
        text += "<br/>";
        text += 'Your account setup is complete! Now you can start using the Traffic Bridge system with these credentials.';
        text += "<br/>";
        text += "<br/>";
        text += 'Username: <b>' + user.userName + '</b>';
        text += "<br/>";
        text += 'Password: <b>' + password + '</b>';
        text += "<br/>";
        text += "<br/>";
        text += "<br/>";
        text += 'Thanks,';
        text += "<br/>";
        text += 'Traffic Bridge Team.';

        var html = text;
        mailer.sendWelcomeMail(user.email, text, html, function (error, info) {

            if (error) {
                logger.error(error, 'error');
            }
            else {
                logger.debug(info, 'Message sent');
            }
        });
    }

    function updateUser(req, res) {
        var payload = req.body;
        var userId = payload._id;

        //userName & email are always lowercase!
        payload.userName = payload.userName.toLowerCase();
        payload.email = payload.email.toLowerCase();

        //updated_at
        payload.updated_at = new moment();

        var query = {_id: userId};

        return User
            .updateAsync(query, payload)
            .then(function (user) {

                logger.debug(user, 'updateUser');
                //update userName in dataaccessgroups Collection also, for Security!
                return _updateDataAccessGroups(payload.groups, payload.userName)
                    .then(function (promises) {
                        //return the user
                        res.send(user);
                    })
                    .catch(function (error) {
                        logger.error(error, 'Error while updating data access groups for the user.');
                        return res.send({
                            status: 'ERROR',
                            error: error.toString()
                        });
                    });
                //res.send(user);
            })
            .catch(function (error) {

                logger.error(error, 'ERROR: while updating the User ' + userId);
                return res.status(500).send({reason: error.toString()});
            });
    }

    function inactiveUser(req, res) {

    }

    function resetPassword(req, res) {
        var userName = req.body.userName;
        var email = req.body.email;

        var query = {userName: userName};

        //password creation logic
        var _password = pwdutils.generatePassword();
        var _salt = encrypt.createSalt();
        var _hashed_pwd = encrypt.HashPasword(_salt, _password);

        var payload = {
            salt: _salt,
            hashed_pwd: _hashed_pwd,
            unsuccessfulLoginAttempts: 0
        };

        return User
            .findOneAndUpdateAsync(query, payload)
            .then(function (user) {

                logger.debug(user, 'resetPassword');
                //send the password reset email for the user
                _sendPasswordResetEmail(userName, email, _password);
                //return the user
                res.send(user._id);
            })
            .catch(function (error) {

                logger.error(error, 'ERROR: while resetting the password for User ' + userName);
                return res.status(500).send({reason: error.toString()});
            });
    }

    function _sendPasswordResetEmail(userName, email, password) {
        var text = '';
        text += 'Dear ' + userName + ',';
        text += "<br/>";
        text += "<br/>";
        text += 'Your password for TrafficBridge was reset. Your new password is below. You must use this password to log into Traffic Bridge. You may change your password via your User Profile after you log in.';
        text += "<br/>";
        text += "<br/>";
        text += 'Username: <b>' + userName + '</b>';
        text += "<br/>";
        text += 'Password: <b>' + password + '</b>';
        text += "<br/>";
        text += "<br/>";
        text += "<br/>";
        text += 'Thanks,';
        text += "<br/>";
        text += 'Traffic Bridge Team.';

        var html = text;
        mailer.sendPasswordResetMail(email, text, html, function (error, info) {
            if (error) {
                logger.error(error, 'error');
            }
            else {
                logger.debug(info, 'Message sent');
            }
        });
    }

    return {
        getUsers: getUsers,
        getUserById: getUserById,
        getUserByName: getUserByName,
        createUser: createUser,
        updateUser: updateUser,
        deleteUser: inactiveUser,
        resetPassword: resetPassword
    };

};
