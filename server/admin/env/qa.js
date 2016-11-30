/* jshint node:true */
'use strict';

var development = require('./development');

module.exports = {
    APP_URL: 'http://trafficbridge-qa.elasticbeanstalk.com',    
    app: {
        jsFiles: development.app.jsFiles,
        cssFiles: development.app.cssFiles
    },
    db: {
        mongo: {
	    app: {
		uri: 'mongodb://trafficbridge:Talent123!@c522.candidate.45.mongolayer.com:10522,c830.candidate.34.mongolayer.com:10830/app?replicaSet=set-5511c1cd15d6e92de2000320'
	    },
	    session: {
		uri: 'mongodb://trafficbridge:Talent123!@c522.candidate.45.mongolayer.com:10522,c830.candidate.34.mongolayer.com:10830/app?replicaSet=set-5511c1cd15d6e92de2000320'		
	    }
        }		
    },
    aws: {
        accessKeyId: 'AKIAJ5WJF7Y4HJEFFCFA',
        secretAccessKey: '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',
        region: 'us-east-1',	
        bucket: {
            ingest: 'trafficbridge-ingestion-qa',
            ucr: 'trafficbridge-importucr-qa'
        }
    },
    logger: {
        bunyan: {
            name: 'trafficbridge',
            level: 'debug'
        }
    }
};
