"use strict";

var moment = require('moment');
var Promise = require('bluebird');
var constants = require('../../constants');
var logger = require('../../utilities/logger');

module.exports = function (app) {

    var db = app.locals.db;

    function getSellingTitles(req, res) {

    }
    function getSellingTitleById(req, res) {

    }
    function getSellingTitleByName(req, res) {

    }
    function createSellingTitle(req, res) {

    }

    function updateSellingTitle(req, res) {

    }

    function inactiveSellingTitle(req, res) {

    }

    return {
        getSellingTitles: getSellingTitles,
        getSellingTitleById: getSellingTitleById,
        getSellingTitleByName: getSellingTitleByName,
        createSellingTitle: createSellingTitle,
        updateSellingTitle: updateSellingTitle,
        deleteSellingTitle: inactiveSellingTitle
    }
};