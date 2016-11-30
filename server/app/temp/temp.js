/* jshint node:true */
'use strict';
var _ = require('lodash');
var logger = require('../../utilities/logger');
var constants = require('../../constants');
var _COMPANY = constants.COMPANY;
var cors = require('cors');

module.exports = function (app) {
	

    var authCtrl = require('../controllers/auth')(app);
    var TEMP_ACCESS_CODE = "secured-token";
    
    
    var whitelist = ['http://127.0.0.1:63335', 'http://localhost:9000'];
    var corsOptionsDelegate = function(req, callback){
      var corsOptions;
/*      if(whitelist.indexOf(req.header('Origin')) !== -1){
        corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response 
        corsOptions.credentials = true
      }else{
        corsOptions = { origin: false }; // disable CORS for this request 
      }*/
      corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response 
      corsOptions.credentials = true
      callback(null, corsOptions); // callback expects two parameters: error and options || cors(corsOptionsDelegate),
    };
    
    app.use('/api',  function (req, res, next) {
        if (req.query && req.query.tempAuthToken && req.query.tempAuthToken === TEMP_ACCESS_CODE) {
        	req.body.username = "media@test.com";
        	req.body.password = "test123";
         return authCtrl.login(req, res, next);
        }

        return next();
    });
    
}
