"use strict";

var moment = require('moment');
var Promise = require('bluebird');
var constants = require('../../constants');
var logger = require('../../utilities/logger');

module.exports = function (app) {

    var db = app.locals.db;
    var Advertiser = db.advertiser;

    function getAdvertisers(req, res) {

        var select = '';
        Advertiser
            .find({}, select)
            .sort({'updated_at': -1})
            .execAsync()
            .then(function (advertisers) {
                logger.debug(advertisers, 'getAdvertisers: ');

                res.send(advertisers);
            })
            .catch(function (err) {

                logger.error(error, 'Error while getting the advertisers list.');

                res.send({
                    status: 'ERROR',
                    error: error.toString()
                });
            });
    }

    function getAdvertiserById(req, res) {
        var aId = req.params.aId;

        Advertiser
            .findOneAsync({_id: aId})
            .then(function (advertiser) {

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

    function getAdvertiserByName(req, res) {
        var nname = req.params.advertiser_name;

        Advertiser
            .findOneAsync({name: nname})
            .then(function (advertiser) {
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

    function createAdvertiser(req, res) {

        var advertiser = req.body;

        return Advertiser
            .createAsync(advertiser)
            .then(function (advertiser) {

                logger.debug(user, 'createUser');

                res.send(user);
            })
            .catch(function (error) {

                logger.error(error, 'ERROR: while creating the User ');

                return res.status(500).send({reason: error.toString()});
            });
    }

    function updateAdvertiser(req, res) {
        var aId = req.params.aId;
        var advertiser = req.body;

        return Advertiser
            .updateAsync({_id: aId}, advertiser)
            .then(function (advertiser) {

                logger.debug(user, 'updateUser');
                res.send(user);
            })
            .catch(function (error) {

                logger.error(error, 'ERROR: while updating the User ' + userId);
                return res.status(500).send({reason: error.toString()});

            });
    }

    function inactiveAdvertiser(req, res) {

        var aId = req.params.aId;

        Advertiser
            .updateAsync({_id: aId}, {active: 'N'})
            .then(function (advertiser) {

                logger.debug(advertiser, 'inactiveadvertiser');
                res.send(advertiser);
            })
            .catch(function (error) {

                logger.error(error, 'ERROR: while updating the Advertiser ' + aId);
                return res.status(500).send({reason: error.toString()});

            });
    }

    return {
        getAdvertisers: getAdvertisers,
        getAdvertiserById: getAdvertiserById,
        getAdvertiserByName: getAdvertiserByName,
        createAdvertiser: createAdvertiser,
        updateAdvertiser: updateAdvertiser,
        deleteAdvertiser: inactiveAdvertiser
    }
};