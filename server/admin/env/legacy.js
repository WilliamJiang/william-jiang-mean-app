/* jshint node:true */
'use strict';

var common = require('./common');

module.exports = {
    APP_URL: 'http://trafficbridge-legacy.elasticbeanstalk.com',    
    app: {
        jsFiles: common.app.jsFiles.concat([
            '/app/tc/tc.module.js',
            '/app/cc/cc.module.js',
            '/app/main/main.module.js',
            '/app/common/common.module.js',
            '/app/signup/signup.module.js',
            '/app/profile/profile.module.js',
            '/app/login/login.module.js',
            '/app/app.js',
            '/app/main/MainCtrl.js',
            '/app/main/DebugCtrl.js',
            '/app/login/LoginCtrl.js',
            '/app/account/mvIdentity.js',
            '/app/services/AuthService.js',
            '/app/services/CIPollerService.js',
            '/app/services/CICountsPollerService.js',
            '/app/services/DataService.js',
            '/app/services/NotifierService.js',
            '/app/services/UtilsService.js',
            '/app/common/ApplicationCtrl.js',
            '/app/common/HeaderCtrl.js',
            '/app/admin/mvUserListCtrl.js',
            '/app/signup/SignupCtrl.js',
            '/app/profile/ProfileCtrl.js',
            '/app/tc/TrafficCoordinatorLeftNavCtrl.js',
            '/app/tc/TrafficCoordinatorHomeCtrl.js',
            '/app/tc/TrafficCoordinatorAddCICtrl.js',
            '/app/cc/ci/CopyCoordinatorCIModalCtrl.js',
            '/app/cc/ci/CopyCoordinatorCIEditMetadataCtrl.js',
            '/app/cc/ci/CIRevisionsCtrl.js',
            '/app/cc/CopyCoordinatorQueueCtrl.js',
            '/app/cc/CopyCoordinatorLeftNavCtrl.js',
            '/app/cc/CopyCoordinatorHomeCtrl.js',
            '/app/cc/CopyCoordinatorArchiveCtrl.js',
            '/app/cc/CopyCoordinatorLibraryCtrl.js',
            '/app/cc/CopyCoordinatorParkingLotCtrl.js',
            '/app/cc/CopyCoordinatorRevisionCtrl.js',
            '/app/cc/CopyCoordinatorCICtrl.js',
            '/app/cc/CopyCoordinatorAddCICtrl.js',
            '/app/cc/CopyCoordinatorImportUCRCtrl.js',	    
            '/app/cc/CopyCoordinatorCIMetadataCtrl.js',
            '/app/cc/CopyCoordinatorCIPossibleRevisionDetectedCtrl.js',    
            '/app/cc/CopyCoordinatorCIViewCtrl.js',
            '/app/cc/CopyCoordinatorCIViewCtrl2.js',
            '/app/cc/CopyCoordinatorCIHistoryCtrl.js',
            '/app/cc/TypeaheadCtrl.js',
            '/app/models/CI.js',
            '/app/filters/pageOffsetFilter.js',
            '/app/filters/stringFilters.js',
            '/app/directives/dateValidator.js'	   
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
		uri: 'mongodb://admin:admin123@dogen.mongohq.com:10089/pavani-mongo-db'
	    },
	    session: {
		uri: 'mongodb://admin:admin123@dogen.mongohq.com:10089/pavani-mongo-db'		
	    }
        }
    },	
    aws: {
        accessKeyId: 'AKIAJ5WJF7Y4HJEFFCFA',
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
