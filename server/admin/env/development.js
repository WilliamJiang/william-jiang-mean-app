/* jshint node:true */
'use strict';
/**
 * william comment:
 *  in admin, there should no '/app/' stuff: they should be separated.
 */
var common = require('./common');

module.exports = {
    APP_URL: 'http://trafficbridge-admin.elasticbeanstalk.com',
    app: {
        jsFiles: common.app.jsFiles.concat([
            '/admin/app.js',
            '/admin/login/login.module.js',
            '/admin/signup/signup.module.js',
            '/admin/directives/ui-router-tabs.js',
            '/admin/controllers/adminCtrl.js',
            '/admin/controllers/adminMenuCtrl.js',
            '/admin/controllers/adminAdvertiserCtrl.js',
            '/admin/controllers/adminAdvTypeCtrl.js',
            '/admin/controllers/adminBrandCtrl.js',
            '/admin/controllers/adminCompanyCtrl.js',
            '/admin/controllers/adminGroupCtrl.js',
            '/admin/controllers/adminNetworkCtrl.js',
            '/admin/controllers/adminProgramCtrl.js',
            '/admin/controllers/adminUsersListCtrl.js',
            '/admin/controllers/adminUserCtrl.js',
            '/admin/directives/formDirectives.js',
            '/admin/services/formServices.js',
            '/admin/routers/routers.js',
            '/admin/services/mvIdentity.js',
            '/admin/services/AuthService.js',
            '/admin/services/DataService.js',
            '/admin/services/FilterService.js',
            '/admin/directives/filters_directive.js',
            '/admin/services/NotifierService.js',
            '/admin/services/UtilsService.js',
            '/admin/login/LoginCtrl.js',
            '/admin/signup/SignupCtrl.js'
        ]),
        cssFiles: common.app.cssFiles.concat([
            '/css/main.css',
            '/css/main-tb-overrides.css',
            '/css/animate.css',
            '/css/dropdowns-enhancement.css',
            '/css/pg.progress-bars.css',
            '/css/admin.css'
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
    logger: {
        bunyan: {
            name: 'trafficbridge-admin',
            level: 'debug'
        }
    }
};
