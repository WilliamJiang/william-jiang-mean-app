/* jshint node:true */
'use strict';

var common = require('./common');

module.exports = {
    APP_URL: 'http://dev.trafficbridge.tv',
    TBPROCESSING_URL: process.env.TBPROCESSING_URL || 'http://ingest-dev.trafficbridge.tv',
    REMOTE_COMPARE_SERVICE_URL: process.env.TBPROCESSING_URL || 'http://ingest-dev.trafficbridge.tv',
    app: {
        jsFiles: common.app.jsFiles.concat([
            '/app/tc/tc.module.js',
            '/app/cc/cc.module.js',
            '/app/main/main.module.js',
            '/app/common/common.module.js',
            '/app/profile/profile.module.js',
            '/app/login/login.module.js',
            '/app/app.js',
            '/app/main/MainCtrl.js',
            '/app/main/DebugCtrl.js',
            '/app/directives/about_directive.js',
            '/app/login/LoginCtrl.js',
            '/app/login/ForgotCredentialsCtrl.js',
            '/app/account/mvIdentity.js',
            '/app/services/AuthService.js',
            '/app/services/CIPollerService.js',
            '/app/services/CICountsPollerService.js',
            '/app/services/DataService.js',
            '/app/services/NotifierService.js',
            '/app/services/UploadService.js',
            '/app/services/UtilsService.js',
            '/app/services/FilterService.js',
            '/app/common/ApplicationCtrl.js',
            '/app/profile/ProfileCtrl.js',
            '/app/directives/filters_directive.js',
            '/app/directives/zoom_directive.js',
            '/app/directives/pdf_view_directive.js',
            '/app/directives/daterange/daterange_directive.js',
            '/app/tc/TrafficCoordinatorLeftNavCtrl.js',
            '/app/tc/TrafficCoordinatorHomeCtrl.js',
            '/app/tc/TrafficCoordinatorCICtrl.js',
            '/app/tc/TrafficCoordinatorLibraryCtrl.js',
            '/app/tc/TrafficCoordinatorAddCICtrl.js',
            '/app/tc/TrafficCoordinatorCIViewCtrl.js',
            '/app/cc/ci/CopyCoordinatorCIModalCtrl.js',
            '/app/cc/ci/CopyCoordinatorCIEditMetadataCtrl.js',
            '/app/cc/ci/CIRevisionsCtrl.js',
            '/app/cc/ci/UploadDocumentCtrl.js',
            '/app/cc/ci/NewCICtrl.js',
            '/app/cc/ci/PossibleRevisionCICtrl.js',
            '/app/cc/ci/UnstapleReasonCtrl.js',
            '/app/cc/CopyCoordinatorQueueCtrl.js',
            '/app/cc/CopyCoordinatorLeftNavCtrl.js',
            '/app/cc/CopyCoordinatorHomeCtrl.js',
            '/app/cc/CopyCoordinatorArchiveCtrl.js',
            '/app/cc/CopyCoordinatorLibraryCtrl.js',
            '/app/cc/SaveSearchCtrl.js',
            '/app/cc/DeleteSearchCtrl.js',
            '/app/cc/CopyCoordinatorParkingLotCtrl.js',
            '/app/cc/CopyCoordinatorCICtrl.js',
            '/app/cc/CopyCoordinatorImportUCRCtrl.js',
            '/app/cc/CopyCoordinatorCIHistoryCtrl.js',
            '/app/cc/TypeaheadCtrl.js',
            '/app/models/CI.js',
            '/app/filters/pageOffsetFilter.js',
            '/app/filters/stringFilters.js',
            '/app/directives/dateValidator.js',
            '/app/directives/annotation/viewAllAnnotations.js'
        ]),
        cssFiles: common.app.cssFiles.concat([
            '/css/main.css',
            '/css/main-tb-overrides.css',
            '/css/animate.css',
            '/css/dropdowns-enhancement.css',
            '/css/pg.progress-bars.css'
        ])
    },
    db: {
        mongo: {
            app: {
                uri: 'mongodb://trafficbridge:Talent123!@c523.candidate.45.mongolayer.com:10523,c831.candidate.34.mongolayer.com:10831/app?replicaSet=set-5511c1f3f8907fc6ea000508',
                options: {
                    server: {
                        poolSize: 12
                    }
                }
            },
            session: {
                uri: 'mongodb://trafficbridge:Talent123!@c523.candidate.45.mongolayer.com:10523,c831.candidate.34.mongolayer.com:10831/app?replicaSet=set-5511c1f3f8907fc6ea000508'
            }
        }
    },
    aws: {
        //accessKeyId: 'AKIAJ5WJF7Y4HJEFFCFA',
        //secretAccessKey: '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',
        accessKeyId: 'AKIAITWWFTUXOZLWSK2A',
        secretAccessKey: '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',
        region: 'us-east-1',
        bucket: {
            ingest: 'trafficbridge-ingestion-dev',
            ucr: 'trafficbridge-importucr-dev'
        }
    },
    logger: {
        bunyan: {
            name: 'trafficbridge',
            level: 'debug'
        }
    }
};
