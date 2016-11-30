/* jshint node:true */
'use strict';

//var common = require('./common');
var development = require('./development');

module.exports = {
    APP_URL: 'http://demo.trafficbridge.tv',
    TBPROCESSING_URL: process.env.TBPROCESSING_URL || 'http://ingest-demo.trafficbridge.tv',
    REMOTE_COMPARE_SERVICE_URL: process.env.TBPROCESSING_URL  || 'http://ingest-demo.trafficbridge.tv',
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
                uri: 'mongodb://trafficbridge:Talent123!@c920.candidate.13.mongolayer.com:10920,candidate.19.mongolayer.com:11065/app?replicaSet=set-555e0a0038a9a43eed001906'
            },
            session: {
                uri: 'mongodb://trafficbridge:Talent123!@c920.candidate.13.mongolayer.com:10920,candidate.19.mongolayer.com:11065/app?replicaSet=set-555e0a0038a9a43eed001906'
            }
        }
    },
    aws: {
        accessKeyId: 'AKIAJ5WJF7Y4HJEFFCFA',
        secretAccessKey: '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',
        region: 'us-east-1',
        bucket: {
            ingest: 'trafficbridge-ingestion-demo',
            ucr: 'trafficbridge-importucr-demo'
        }
    },
    logger: {
        bunyan: {
            name: 'trafficbridge',
            level: 'error'
        }
    }
};
