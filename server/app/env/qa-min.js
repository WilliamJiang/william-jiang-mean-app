/* jshint node:true */
'use strict';

//var development = require('./development');
var common = require('./common-min');

module.exports = {
    APP_URL: 'http://qa.trafficbridge.tv',
    TBPROCESSING_URL: process.env.TBPROCESSING_URL || 'http://ingest-qa.trafficbridge.tv',
    REMOTE_COMPARE_SERVICE_URL: process.env.TBPROCESSING_URL || 'http://ingest-qa.trafficbridge.tv',
    app: {
        cssFiles: common.app.cssFiles.concat([
            '/app/dist/custom-vendor.min.css',
            '/app/dist/app.min.css'
        ]),
        jsFiles: common.app.jsFiles.concat([
            //'/vendor/angular-truncate/src/truncate.js',
            //'/custom-vendor/multi-select/isteven-multi-select.js',
            //'/custom-vendor/multi-select/advertiser-multi-select.js',
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
            //'/custom-vendor/pdfjs/build/pdf_js.js',
            //'/custom-vendor/pdfjs/web/compatibility.js',
            //'/custom-vendor/pdfjs/web/textlayerbuilder.js',
            //'/custom-vendor/bootstrap-daterangepicker/daterangepicker.js',
            //'/custom-vendor/node-uuid/uuid.js',
            ///////
            //'/scripts/dropdowns-enhancement.js',
            //'/scripts/jquery.mousewheel.js',
            //'/scripts/jquery.jscrollpane.js',
            //'/scripts/main.js',
            //'/scripts/home.js',
            //'/scripts/library.js',
            //'/scripts/compare.js',
            //'/scripts/dropdowns-enhancement.js',
            '/app/dist/custom-vendor.min.js',
            ///////
            '/app/dist/app.min.js',
            //'/app/tc/tc.module.js',
            //'/app/cc/cc.module.js',
            //'/app/main/main.module.js',
            //'/app/common/common.module.js',
            //'/app/profile/profile.module.js',
            //'/app/login/login.module.js',
            //'/app/filters/pageOffsetFilter.js',
            //'/app/directives/dateValidator.js',
            //'/app/app.js',
            //'/app/main/MainCtrl.js',
            //'/app/main/DebugCtrl.js',
            '/app/login/LoginCtrl.js',
            //'/app/login/ForgotCredentialsCtrl.js',
            //'/app/account/mvIdentity.js',
            //'/app/services/AuthService.js',

            //'/app/services/CIPollerService.js',
            //'/app/services/CICountsPollerService.js',
            //'/app/services/DataService.js',
            //'/app/services/NotifierService.js',
            //'/app/services/UploadService.js',
            //'/app/services/UtilsService.js',
            //'/app/services/FilterService.js',
            //'/app/common/ApplicationCtrl.js',
            //'/app/profile/ProfileCtrl.js',
            //'/app/directives/filters_directive.js',
            //'/app/directives/zoom_directive.js',
            //'/app/directives/pdf_view_directive.js',
            //'/app/directives/daterange/daterange_directive.js',
            //'/app/tc/TrafficCoordinatorLeftNavCtrl.js',
            //'/app/tc/TrafficCoordinatorHomeCtrl.js',
            //'/app/tc/TrafficCoordinatorCICtrl.js',

            //'/app/tc/TrafficCoordinatorLibraryCtrl.js',
            //'/app/tc/TrafficCoordinatorAddCICtrl.js',
            //'/app/tc/TrafficCoordinatorCIViewCtrl.js',
            //'/app/cc/ci/CopyCoordinatorCIModalCtrl.js',
            //'/app/cc/ci/CopyCoordinatorCIEditMetadataCtrl.js',
            //'/app/cc/ci/CIRevisionsCtrl.js',
            //'/app/cc/ci/UploadDocumentCtrl.js',
            //'/app/cc/ci/NewCICtrl.js',
            //'/app/cc/ci/PossibleRevisionCICtrl.js',
            //'/app/cc/ci/UnstapleReasonCtrl.js',
            //'/app/cc/CopyCoordinatorQueueCtrl.js',
            //'/app/cc/CopyCoordinatorLeftNavCtrl.js',
            //'/app/cc/CopyCoordinatorHomeCtrl.js',
            //'/app/cc/CopyCoordinatorArchiveCtrl.js',
            //'/app/cc/CopyCoordinatorLibraryCtrl.js',
            //'/app/cc/SaveSearchCtrl.js',
            //'/app/cc/DeleteSearchCtrl.js',
            //'/app/cc/CopyCoordinatorParkingLotCtrl.js',
            //'/app/cc/CopyCoordinatorCICtrl.js',
            //'/app/cc/CopyCoordinatorImportUCRCtrl.js',
            //'/app/cc/CopyCoordinatorCIHistoryCtrl.js',
            //'/app/models/CI.js',
            //'/app/filters/stringFilters.js',
            //'/app/directives/annotation/viewAllAnnotations.js',
            //'/app/dist/app1.min.js',
        ])
        //jsFiles: development.app.jsFiles,
        //cssFiles: development.app.cssFiles,
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
            level: 'info'
        }
    }
};
