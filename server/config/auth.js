/* jshint node:true */
'use strict';

// Express middleware checks for authorization against routes

function requiresApiLogin(req,res,next) {

    if (req.isAuthenticated()) {
        next();
    }
    else {
        res.status(403);
        res.end();
    }
}

function requiresRole(role) {

    return function (req,res,next) {

        if (!req.isAuthenticated() || req.user.roles.indexOf(role) === -1) {
            res.status(403);
            res.end();
        }
        else {
            next();
        }
    }
}

module.exports = {
    requiresApiLogin: requiresApiLogin,
    requiresRole: requiresRole
};
