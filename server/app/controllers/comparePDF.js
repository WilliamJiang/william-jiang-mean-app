/* jshint node:true */
'use strict';

var request = require('request');
var logger = require('../../utilities/logger');

////////////////////////////////////////////////////////////////////////////////

module.exports = function(app) {

    ////
    var db = app.locals.db;
    var config = app.locals.config;
    ////    

    ////////////////////////////////////////////////////////////////////////////////
    
    function compare(req,res) {
	
        var uploadData = {
            doc1: req.body[0],
            doc2: req.body[1]
        };

        var options = {
            method: 'GET',
            url: config.REMOTE_COMPARE_SERVICE_URL + '/api/v1/compare',
            headers: {
                docToCompare1: req.body[0],
                docToCompare2: req.body[1]
            }
        };
	
        logger.debug(options,'options');

        request(options,function(error,httpResponse,body) {

            logger.debug(error,'comparePDF::error');
            logger.debug(httpResponse,'comparePDF::httpResponse');
	    
        }).pipe(res);		
    }
    
    ////////////////////////////////////////////////////////////////////////////////    

    return {
        compare: compare
    };
};
