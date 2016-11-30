"use strict";

var R = require('ramda');
var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');
var constants = require('../../constants');
var _COMPANY = constants.COMPANY;
var _USER = constants.USER;
var logger = require('../../utilities/logger');

module.exports = function (app) {

    var db = app.locals.db;
    var MediaCompany = db.MediaCompany;

    function getCompanies(req, res) {

        var query = {};
        //var select = '_id firstName lastName userName email roles affiliation created_at updated_at start_date end_date';

        MediaCompany
            .findAsync(query)
            .then(function (companies) {

                logger.debug(companies, 'getCompanies: ');

                res.send(companies);
            })
            .catch(function (error) {

                logger.error(error, 'Error while getting the Media Company list.');

                return res.send({
                    status: 'ERROR',
                    error: error.toString()
                });
            });
    }

    function getCompanyById(req, res) {

        MediaCompany.findOneAsync({_id: req.params.gid})
            .then(function (group) {
                res.status(200).send(group);
            })
            .catch(function (error) {
                res.status('ERROR').send(error.toString())
            });
    }

    function getCompanyByName(req, res) {

        var nname = req.params.brand_name;
        MediaCompany
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

    function createCompany(req, res) {

        var company = req.body;
        return MediaCompany
            .createAsync(company)
            .then(function (company) {

                logger.debug(user, 'createUser');

                res.send(user);
            })
            .catch(function (error) {

                logger.error(error, 'ERROR: while creating the User ');

                return res.status(500).send({reason: error.toString()});
            });
    }

    function updateCompany(req, res) {
        var bId = req.params.bId;
        var company = req.body;

        return MediaCompany
            .updateAsync({_id: bId}, company)
            .then(function (company) {

                logger.debug(user, 'updateUser');
                res.send(user);
            })
            .catch(function (error) {

                logger.error(error, 'ERROR: while updating the User ' + userId);
                return res.status(500).send({reason: error.toString()});

            });
    }

    function inactiveCompany(req, res) {

        var bId = req.params.bId;

        MediaCompany
            .updateAsync({_id: bId}, {active: 'N'})
            .then(function (company) {

                logger.debug(company, 'inactiveGroup');
                res.send(company);
            })
            .catch(function (error) {

                logger.error(error, 'ERROR: while updating the Company ' + bId);
                return res.status(500).send({reason: error.toString()});

            });
    }

    return {
        getCompanies: getCompanies,
        getCompanyById: getCompanyById,
        getCompanyByName: getCompanyByName,
        createCompany: createCompany,
        updateCompany: updateCompany,
        deleteCompany: inactiveCompany
    }
};