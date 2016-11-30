/* jshint node:true */
'use strict';

var _ = require('lodash');
var moment = require('moment');
var _USER = require('../../constants').USER;
var _COMPANY = require('../../constants').COMPANY;
var encrypt = require('../../utilities/encryption');
var logger = require('../../utilities/logger');

////////////////////////////////////////////////////////////////////////////////

module.exports = function(app) {

    ////
    var db = app.locals.db;
    ////
    var User = db.User;
    ////

    function getUsers(req, res) {

        User
            .find({})
            .exec(function (err, usersCollection) {
                res.send(usersCollection);
            })
    };

    ////////////////////////////////////////////////////////////////////////////////
    // HACK, duplicate code kenmc

    function getCompany(db,user) {

	logger.debug(user,'getCompany::user');
	logger.debug(_COMPANY,'_COMPANY');	
	
        var _Agency = db.Agency;//conn.model('Agency');
        var _MediaCompany = db.MediaCompany;//conn.model('MediaCompany');

        logger.debug(user.affiliation,'user.affiliation');	
        logger.debug(user.affiliation.type,'user.affiliation.type');

        if (user.affiliation.type === _COMPANY.TYPE.AGENCY) {

            return _Agency
                .findOneAsync({ _id: user.affiliation.ref_id });
        }
        else if (user.affiliation.type === _COMPANY.TYPE.MEDIA_COMPANY) {

            //logger.debug(user.affiliation.type,'user.affiliation.type');
            //logger.debug(user.affiliation.ref_id,'user.affiliation.ref_id');

            return _MediaCompany
                .findOneAsync({ _id: user.affiliation.ref_id });
        }
    }

    function createUser(req, res, next) {

        var newUserData = req.body;

        newUserData.start_date = new moment('01/01/1999');
        newUserData.end_date = new moment('12/31/2099');

        newUserData.userName = newUserData.userName.toLowerCase();
        newUserData.salt = encrypt.createSalt();
        newUserData.hashed_pwd = encrypt.HashPasword(newUserData.salt, newUserData.password);

        if (newUserData.affiliation.type === 'agency') {
            newUserData.roles = [_USER.ROLES.AGENCY.USER];
        }
        else if (newUserData.affiliation.type === 'media_company') {
            newUserData.roles = [_USER.ROLES.MEDIA_COMPANY.USER];
        }

        //logger.debug(newUserData, 'newUserData');

        User
            .createAsync(newUserData)
            .then(function (user) {

                logger.debug(user, 'user');

                return getCompany(db,user);
            })
            .then(function (company) {

                //logger.debug(company, 'company');

                var _user = user.toObject();
                _user.affiliation.company = company;

                logger.debug(_user, 'user');

                req.logIn(_user, function (err) {

                    if (err) {
                        return next(err);
                    }

                    res.send(_user);
                })
            })
            .catch(function (err) {

                if (err.toString().indexOf('E11000') > -1) {
                    err = new Error('Duplicate Email/Username');
                }

                res.status(400);

                return res.send({
                    reason: err.toString()
                });
            });
    }

    function updateUser(req, res) {

        var userData = req.body;

        //logger.debug(userData,'userData');
        //logger.debug(req.user,'req.user');

        if (req.user._id != userData._id && !req.user.hasRole('admin')) {

            logger.debug(userData, 'userData::403');

            res.status(403);
            res.end();

            return;
        }

        //update the User in Request
        req.user.firstName = userData.firstName;
        req.user.lastName = userData.lastName;
        req.user.userName = userData.userName;

        if (userData.password && userData.password.length > 0) {
            req.user.salt = encrypt.createSalt();
            req.user.hashed_pwd = encrypt.HashPasword(req.user.salt, userData.password);
        }

        var user = _.omit(req.user, '_id');
        //logger.debug(user,'user');

        User
            .findOneAndUpdateAsync({_id: req.user._id}, user)
            .then(function (obj) {

                //logger.debug(obj, 'obj');
                //logger.debug(req.user, 'req.user');

                return res.send(req.user);
            })
            .catch(function (err) {

                logger.debug(err, 'err');

                res.status(400);

                return res.send({
                    reason: err.toString()
                });
            });
    }

    // TODO HACKED to fix kenmc
    function setActiveNetwork(req, res) {

        //logger.debug(req.user, 'req.user');
	
        var active_network = req.body.value;
        logger.debug(active_network, 'active_network');

        // TODO validate that active_network is VALID! kenmc

        var user = req.user;//_.omit(req.user,'_id');
	
	var __user;
	
        User
            .findByIdAsync(user._id)
            .then(function (_user) {

                logger.debug(_user, '_user');

                _user.affiliation = _user.affiliation || {};
                _user.affiliation.metadata = _user.affiliation.metadata || {};
                _user.affiliation.metadata.active_network = active_network;
                _user.markModified('affiliation');

                return _user
                    .saveAsync();
            })
            .then(function (_user) {
	    
                logger.debug(_user, '_user0');

		__user = _user[0];

                return getCompany(db,__user);
            })
            .then(function (company) {

                logger.debug(__user, '_user00'); 

                var ___user = __user.toObject();
                ___user.affiliation.company = company;

                return res.send(___user);
            })
            .catch(function (error) {

		logger.error(error,'error');

                res.status(400);

                return res.send({
                    reason: error.toString()
                });
            });
    }
    
    
    function updateUserPassword(user, password) {
        if (password && password.length > 0) {
            user.salt = encrypt.createSalt();
            user.hashed_pwd = encrypt.HashPasword(user.salt, password);
        }
        
        return user.saveAsync();
    }
    
    function getUserForCredentials(email, userName){
    	if(!email && !userName){
    		return null;
    	}
    	var query = {};
    	
    	if(email){
        	query.email = email;
    	}

    	if(userName){
    		query.userName = userName
    	}
        return db.User.findOneAsync(query);
    }

    return {
        getUsers: getUsers,
        createUser: createUser,
        updateUser: updateUser,
        setActiveNetwork: setActiveNetwork,
        getUserForCredentials: getUserForCredentials,
        updateUserPassword: updateUserPassword
    };
};
