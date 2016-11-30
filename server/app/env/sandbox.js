/* jshint node:true */
'use strict';

var development = require('./development');

module.exports = {
    APP_URL: 'http://localhost:3000',
    TBPROCESSING_URL: process.env.TBPROCESSING_URL || 'http://ingest-sandbox.trafficbridge.tv',
    REMOTE_COMPARE_SERVICE_URL: process.env.TBPROCESSING_URL || 'http://ingest-sandbox.trafficbridge.tv',
    app: {
        jsFiles: development.app.jsFiles,
        cssFiles: development.app.cssFiles
    },
    db: {
        mongo: {
            app: {
                uri: 'mongodb://trafficbridge:Talent123!@candidate.43.mongolayer.com:10967,candidate.17.mongolayer.com:11014/app?replicaSet=set-55759b257161007631000778',
                options: {
                    server: {
                        poolSize: 12
                    }
                }
            },
            session: {
                uri: 'mongodb://trafficbridge:Talent123!@candidate.43.mongolayer.com:10967,candidate.17.mongolayer.com:11014/app?replicaSet=set-55759b257161007631000778',
            }
        }
    },
    aws: {
        accessKeyId: 'AKIAJ5WJF7Y4HJEFFCFA',
        secretAccessKey: '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',
        region: 'us-east-1',
        bucket: {
            ingest: 'trafficbridge-ingestion-sandbox',
            ucr: 'trafficbridge-importucr-sandbox'
        }
    },
    logger: {
        bunyan: {
            name: 'trafficbridge',
            level: 'debug'
        }
    }
};
