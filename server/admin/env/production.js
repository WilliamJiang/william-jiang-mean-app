/* jshint node:true */
'use strict';

//var common = require('./common');
var development = require('./development');

module.exports = {
    APP_URL: 'http://trafficbridge-prod.elasticbeanstalk.com',        
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
		uri: 'mongodb://trafficbridge:Talent123!@c649.candidate.41.mongolayer.com:10649,c752.candidate.14.mongolayer.com:10752/app?replicaSet=set-54f5dce946a9bb62f700001c'
	    },
	    session: {
		uri: 'mongodb://trafficbridge:Talent123!@c649.candidate.41.mongolayer.com:10649,c752.candidate.14.mongolayer.com:10752/app?replicaSet=set-54f5dce946a9bb62f700001c'
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
