"use strict";

var R = require('ramda');
var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');
var constants = require('../../constants');
var _COMPANY = constants.COMPANY;
var logger = require('../../utilities/logger');

module.exports = function (app) {

    var db = app.locals.db;
    var DataAccessGroup = db.DataAccessGroup;
    var Company = db.MediaCompany;

    function getGroups1(req, res) {

        var select_fields = '_id mediaCompanyID name allNetworks networks termination_date status';

        DataAccessGroup.findAsync({}, select_fields)
            .then(function (groups) {
                res.status(200).send(groups);
            })
            .catch(function (error) {
                res.status('ERROR').send(error.toString())
            });
    }

    function getGroups(req, res) {

        return DataAccessGroup
            .find()
            .sort({ updated_at: -1 })
            .execAsync()
            .then(function (groups) {
                logger.debug(groups, 'getGroups: ');

                return res.status(200).send(groups);
            })
            .catch(function (error) {
                logger.error(error, 'Error while getting groups');

                return res.send({
                    status: 'ERROR',
                    error: error.toString()
                });
            });
    }

    function getGroupById(req, res) {

        DataAccessGroup.findOneAsync({_id: req.params.gid})
            .then(function (group) {
                logger.debug(group, 'getGroupById: ');

                res.status(200).send(group);
            })
            .catch(function (error) {
                logger.error(error, 'Error while getting group by Id.');

                res.status('ERROR').send(error.toString())
            });
    }

    function getGroupByName(req, res) {
        var nname = req.params.name;

        Company
            .findOneAsync({name: nname})
            .then(function (company) {
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

    function createGroup(req, res) {

        var group = req.body;

        group.updated_at = new moment();

        return DataAccessGroup
            .createAsync(group)
            .then(function (group) {
                logger.debug(group, 'createGroup');

                res.send(group);
            })
            .catch(function (error) {
                logger.error(error, 'ERROR: while creating the Group.');

                return res.status(500).send({reason: error.toString()});
            });
    }

    function updateGroup(req, res) {
        var gId = req.params.gid;
        var group = req.body;
        group.updated_at = new moment();

        return DataAccessGroup
            .updateAsync({_id: gId}, group)
            .then(function (group) {

                res.send(group);
            })
            .catch(function (error) {

                logger.error(error, 'ERROR: while updating the Group ' + gId);
                return res.status(500).send({reason: error.toString()});

            });
    }

    function inactiveGroup(req, res) {

        var gId = req.params.gid;

        DataAccessGroup
            .updateAsync({_id: gId}, {status: 'Inactive'})
            .then(function (group) {

                res.send(group);
            })
            .catch(function (error) {

                logger.error(error, 'ERROR: while updating the Group ' + gId);
                return res.status(500).send({reason: error.toString()});

            });
    }

    return {
        getGroups: getGroups,
        getGroupById: getGroupById,
        getGroupByName: getGroupByName,
        createGroup: createGroup,
        updateGroup: updateGroup,
        deleteGroup: inactiveGroup
    }
};