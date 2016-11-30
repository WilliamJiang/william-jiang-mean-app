/* jshint node:true */
'use strict';

//var common = require('./common-min');
var development = require('./development');

module.exports = {
    APP_URL: 'http://qa.trafficbridge.tv',
    TBPROCESSING_URL: process.env.TBPROCESSING_URL || 'http://ingest-qa.trafficbridge.tv',
    REMOTE_COMPARE_SERVICE_URL: process.env.TBPROCESSING_URL || 'http://ingest-qa.trafficbridge.tv',
    app: {
	/*
        cssFiles: common.app.cssFiles.concat([
            '/app/dist/custom-vendor.min.css',
            '/app/dist/app.min.css'
        ]),
        jsFiles: common.app.jsFiles.concat([
            '/custom-vendor/annotator/1.2.9/annotator-full.1.2.9.js',
            '/custom-vendor/annotator/1.2.9/js/jquery.dateFormat.js',
            '/custom-vendor/annotator/1.2.9/js/jquery.slimscroll.js',
            '/custom-vendor/annotator/1.2.9/plugins/SideViewer.js',
            '/custom-vendor/annotator/1.2.9/plugins/Categories.js',
            '/custom-vendor/annotator/1.2.9/plugins/AnnotatorMarker.js',
            '/custom-vendor/annotator/1.2.9/plugins/AnnotationStore.js',
            '/custom-vendor/annotator/plugins/message-plugin.js',
            '/custom-vendor/annotorious/annotorious.okfn.custom.js',
            '/custom-vendor/xml2json/xml2json.js',
            '/app/dist/custom-vendor.min.js',
            '/app/dist/app.min.js',
            '/app/login/LoginCtrl.js',
        ])
	*/
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
