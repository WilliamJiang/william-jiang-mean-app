/* jshint node:true */
'use strict';

var constants = require('../../constants');
var logger = require('../../utilities/logger');

////////////////////////////////////////////////////////////////////////////////

module.exports = function (app) {

    ////    
    var config = app.locals.config;
    var db = app.locals.db;
    ////

    function admin(req, res) {
        res.send({ok: 1});
    }

    return {
        admin: admin
    };
};
