"use strict";

var moment = require('moment');
var Promise = require('bluebird');
var constants = require('../../constants');
var logger = require('../../utilities/logger');

module.exports = function (app) {

    var db = app.locals.db;
    var Brand = db.brand;

    function getBrands(req, res) {

        var select = '';
        Brand
            .find({}, select)
            .sort({'updated_at': -1})
            .execAsync()
            .then(function (brands) {
                logger.debug(brands, 'getBrands: ');

                res.send(brands);
            })
            .catch(function (err) {

                logger.error(error, 'Error while getting the brands list.');

                res.send({
                    status: 'ERROR',
                    error: error.toString()
                });
            });
    }

    function getBrandById(req, res) {
        var bId = req.params.bId;

        Brand
            .findOneAsync({_id: bId})
            .then(function (brand) {

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
    function getBrandByName(req, res) {
        var nname = req.params.brand_name;

        Brand
            .findOneAsync({name: nname})
            .then(function (brand) {
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

    function createBrand(req, res) {

        var brand = req.body;

        return Brand
            .createAsync(brand)
            .then(function (brand) {

                logger.debug(user, 'createUser');

                res.send(user);
            })
            .catch(function (error) {

                logger.error(error, 'ERROR: while creating the User ');

                return res.status(500).send({reason: error.toString()});
            });
    }

    function updateBrand(req, res) {
        var bId = req.params.bId;
        var brand = req.body;

        return Brand
            .updateAsync({_id: bId}, brand)
            .then(function (brand) {

                logger.debug(user, 'updateUser');
                res.send(user);
            })
            .catch(function (error) {

                logger.error(error, 'ERROR: while updating the User ' + userId);
                return res.status(500).send({reason: error.toString()});

            });
    }

    function inactiveBrand(req, res) {

        var bId = req.params.bId;

        Brand
            .updateAsync({_id: bId}, {active: 'N'})
            .then(function (brand) {

                logger.debug(brand, 'inactiveBrand');
                res.send(brand);
            })
            .catch(function (error) {

                logger.error(error, 'ERROR: while updating the Brand ' + bId);
                return res.status(500).send({reason: error.toString()});

            });
    }

    return {
        getBrands: getBrands,
        getBrandById: getBrandById,
        getBrandByName: getBrandByName,
        createBrand: createBrand,
        updateBrand: updateBrand,
        deleteBrand: inactiveBrand
    }
};