/* jshint node:true */
'use strict';

//var common = require('./common');
var development = require('./development');

module.exports = {
    APP_URL: 'http://localhost:3000',
    TBPROCESSING_URL: process.env.TBPROCESSING_URL || 'http://ingest.trafficbridge.tv',
    REMOTE_COMPARE_SERVICE_URL: process.env.TBPROCESSING_URL  || 'http://ingest.trafficbridge.tv',    
    app: {
	/*
	// Minified JS doesn't work right now for some reason, throws Uncaught SyntaxError: Strict mode function may not have duplicate parameter names kenmc
        jsFiles: common.app.jsFiles.concat([
	    '/dist/output.min.js'
	]),
	cssFiles: common.app.jsFiles.concat([
	    '/dist/app.min.css'
	])
	*/
        jsFiles: development.app.jsFiles,
        cssFiles: development.app.cssFiles	
    },
    db: {
        mongo: {
	    app: {
		uri: 'mongodb://trafficbridge:Talent123!@c540.candidate.2.mongolayer.com:10540,candidate.3.mongolayer.com:10468/app?replicaSet=set-55896924a48501b539000b2d'
	    },
	    session: {
		uri: 'mongodb://trafficbridge:Talent123!@c540.candidate.2.mongolayer.com:10540,candidate.3.mongolayer.com:10468/app?replicaSet=set-55896924a48501b539000b2d'		
	    }
        }			
    },
    aws: {
        accessKeyId: 'AKIAJ5WJF7Y4HJEFFCFA',
        secretAccessKey: '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',
        region: 'us-east-1',	
        bucket: {
	    ingest: 'trafficbridge-ingestion-prod',
	    ucr: 'trafficbridge-importucr-prod'
	}
    },    
    logger: {
        bunyan: {
            name: 'trafficbridge',
            level: 'error'
        }
    }        
};
