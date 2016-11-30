// Authorization and authentication code adapted from:
//https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec
/**
 * TPVTB is the namespace used across the application for all
 * traffic bridge related functions. Please see contents of "/Public/Scripts" folder.
 * @type {{}}
 */
var TPVTB = TPVTB || {};

var app = angular.module('app', [
    'ngResource',
    'ngRoute',
    'ngAnimate',
    'restangular',
    'angularMoment',
    'emguo.poller',
    'ui.bootstrap',
    'truncate',
    'angularFileUpload',
    'ngProgress',
    'pg.progress-bars',
    'ngTagsInput',
    "isteven-multi-select",
    "william-multi-select",
    'trafficbridge.login',
    'trafficbridge.profile',
    'trafficbridge.main',
    'trafficbridge.common',
    'trafficbridge.cc',
    'trafficbridge.tc',
    'tbFilters',
    'tbDirectives'
]);

//https://blog.mariusschulz.com/2014/10/22/asynchronously-bootstrapping-angularjs-applications-with-server-side-data

deferredBootstrapper.bootstrap({
    element: document,
    module: 'app',
    resolve: {
        APP_CONFIG: [
            '$http',
            function ($http) {
                return $http.get('/api/config');
            }
        ]
    }
});

var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;

function convertDateStringsToDates(input) {

    // Skip for annotations data
    if (input && input.isAnnotationData) {
        return input;
    }

    // Ignore things that aren't objects.

    if (typeof input !== "object") return input;

    for (var key in input) {

        if (!input.hasOwnProperty(key)) continue;

        var value = input[key];
        var match;

        // Check for string properties which look like dates.
        if (typeof value === "string" && (match = value.match(regexIso8601))) {

            var milliseconds = Date.parse(match[0]);
            if (!isNaN(milliseconds)) {
                //http://momentjs.com/docs/#/parsing/utc/
                input[key] = moment.utc(new Date(milliseconds));
            }
        }
        else if (typeof value === "object") {
            // Recurse into object
            convertDateStringsToDates(value);
        }
    }
}

function config($compileProvider,
                $routeProvider,
                $locationProvider,
                $httpProvider,
                $sceDelegateProvider,
                RestangularProvider,
                pollerConfig,
                USER_ROLES) {

    /*this is to fix the TimeZone issues of the dates while filing/saving which
     * causes the compare revision logic to miss the dates with different timezones*/
    moment.tz.add('America/New_York|EST EDT|50 40|0101|1Lz50 1zb0 Op0');
    moment.tz.setDefault("America/New_York");

    // See https://docs.angularjs.org/guide/production
    //$compileProvider.debugInfoEnabled(false);    

    // See http://aboutcode.net/2013/07/27/json-date-parsing-angularjs.html

    // Disabled as this is corrupting other data (non-date fields)
    //PAVANIKA: This is breaking all the Date related fields in all screens!
    $httpProvider.defaults.transformResponse.push(function (responseData) {
        convertDateStringsToDates(responseData);
        return responseData;
    });

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self'
        /*
         // Allow loading from s3.
         'https://s3.amazonaws.com/manual-ingestion-uploads/**',
         'https://manual-ingestion-uploads.s3.amazonaws.com/'
         */
    ]);

    RestangularProvider.setBaseUrl('/api');

    // In this case we are mapping the id of each element to the _id field.
    // We also change the Restangular route.
    // The default value for parentResource remains the same.
    RestangularProvider.setRestangularFields({
        id: "_id"
        //route: "restangularRoute",
        //selfLink: "self.href"
    });

    /*
     RestangularProvider.setExtraFields(['name']);
     RestangularProvider.setResponseExtractor(function(response, operation) {
     return response.data;
     });
     */

    /*
     RestangularProvider.addElementTransformer('ci',false,function(element) {
     debugger;
     element.accountName = 'Changed';
     return element;
     });
     */

    /*
     RestangularProvider.setDefaultHttpFields({cache: true});
     RestangularProvider.setMethodOverriders(["put", "patch"]);

     RestangularProvider.setRequestSuffix('.json');

     // Use Request interceptor
     RestangularProvider.setRequestInterceptor(function(element, operation, route, url) {
     delete element.name;
     return element;
     });

     // ..or use the full request interceptor, setRequestInterceptor's more powerful brother!
     RestangularProvider.setFullRequestInterceptor(function(element, operation, route, url, headers, params, httpConfig) {
     delete element.name;
     return {
     element: element,
     params: _.extend(params, {single: true}),
     headers: headers,
     httpConfig: httpConfig
     };
     });
     */

    ////////////////////////////////////////////////////////////////////////////////
    // Resolvers

    var getCounts = [
        'DataService',
        function (DataService) {
            return DataService.CI.getCounts();
        }
    ];

    var getCountsForOwners = [
        'DataService',
        'FilterService',
        function (DataService, FilterService) {
            var _owners = FilterService.getSelectedOwnerIds();
            return DataService.CI.getCountsForOwners(_owners);
        }
    ];

    var resolveCIsForQueue = [
        '$route',
        'DataService',
        'FilterService',
        function ($route, DataService, FilterService) {
            if (angular.isUndefined($route.current.params.searchId)) {
                var _owners = FilterService.getSelectedOwnerIds();
                return DataService.CI.getQueue($route.current.params.queue, _owners);
            } else {
                //library saved search doesn't need to get CIs on the load!
                return {};
            }
        }
    ];

    var resolveOwnersForQueue = [
        'DataService',
        'FilterService',
        'mvIdentity',
        '$route',
        function (DataService, FilterService, mvIdentity, $route) {
            //console.log('######### resolveOwnersForQueue: ' + $route.current.params.queue);
            var ownersList = FilterService.getOwnersNowList();

            if (ownersList.length === 0) {
                //these are all the users across all the networks!
                return DataService
                    .MediaCompanies
                    .getUsers(mvIdentity.currentUser.affiliation.ref_id)
                    .then(function (owners) {
                        //owners dropdown in now queue
                        FilterService.setOwnersNowList(owners);
                        //ignored by dropdown in library
                        FilterService.setIgnoredByUsersList(owners);
                        ownersList = FilterService.getOwnersNowList();

                        return ownersList;
                    })
                    .catch(function (error) {
                        console.log('ERROR while getting the owners information in the Queue.');
                        return [];
                    });
            } else {
                return ownersList;
            }
        }
    ];

    var resolveParkingLot = [
        'DataService',
        function (DataService) {
            return DataService.CI.getParkingLot();
        }
    ];

    var resolveCI = [
        '$route',
        'CI',
        function ($route, CI) {
            return CI.one($route.current.params.id).get();
        }
    ];

    var resolveCIHistory = [
        '$route',
        'DataService',
        function ($route, DataService) {
            return DataService.CI.getHistory($route.current.params.id);
        }
    ];

    var resolveStapledCIs = [
        '$route',
        'DataService',
        function ($route, DataService) {

            return DataService.CI
                .getStapledCIs($route.current.params.id)
                .then(function (cis) {
                    return cis;
                });
        }
    ];

    var resolveCIPossibleRevisions = [
        '$route',
        'Restangular',
        function ($route, Restangular) {
            return Restangular.all('ci/' + $route.current.params.id + '/possible_revisions').getList();
        }
    ];

    var resolveMediaCompanies = [
        'DataService',
        function (DataService) {
            return DataService.MediaCompanies.getAll();
        }
    ];

    var resolvePrograms = [
        'mvIdentity',
        'DataService',
        function (mvIdentity, DataService) {
            return DataService
                .MediaCompanies
                .getProgramsForNetwork(mvIdentity.currentUser.affiliation.ref_id,
                mvIdentity.currentUser.affiliation.metadata.active_network);
        }
    ];

    var resolveUsers = [
        'mvIdentity',
        'DataService',
        function (mvIdentity, DataService) {
            return DataService
                .MediaCompanies
                .getUsers(mvIdentity.currentUser.affiliation.ref_id);
        }
    ];

    ////////////////////////////////////////////////////////////////////////////////

    $routeProvider
        .when('/', {
            templateUrl: '/partials/main/index.html',
            controller: 'MainCtrl'/*,
             data: {
             authorizedRoles: USER_ROLES.all
             }*/
        })
        .when('/login', {
            templateUrl: '/partials/login/index.html',
            controller: 'LoginCtrl'/*,
             data: {
             authorizedRoles: USER_ROLES.all
             }
             */
        })
        .when('/forgot/:credential', {
            templateUrl: '/partials/login/forgot-credential.html',
            controller: 'ForgotCredentialsCtrl'
        })
        .when('/debug', {
            templateUrl: '/partials/main/debug.html',
            controller: 'DebugCtrl',
            data: {
                authorizedRoles: USER_ROLES.all
            }
        })
        .when('/tc/home/:queue', {
            templateUrl: function (params) {

                var templates = {
                    //archive: '/partials/tc/archive.html',
                    library: '/partials/tc/library.html'
                };

                return templates[params.queue] || '/partials/tc/index.html';
            },
            controller: 'TrafficCoordinatorHomeCtrl',
            resolve: {
                queue: ['$route', function ($route) {
                    return $route.current.params.queue;
                }],
                cis: resolveCIsForQueue,
                counts: getCountsForOwners
            },
            data: {
                authorizedRoles: USER_ROLES.agency_all
            }
        })
        .when('/tc/add_ci', {
            templateUrl: '/partials/tc/add_ci.html',
            controller: 'TrafficCoordinatorAddCICtrl',
            resolve: {
                media_companies: resolveMediaCompanies
            },
            data: {
                authorizedRoles: USER_ROLES.agency_all
            }
        })
        .when('/tc/view/:id', {
            templateUrl: '/partials/tc/view.html',
            controller: 'TrafficCoordinatorCIViewCtrl',
            resolve: {
                ci: resolveCI
                //parkinglot: resolveParkingLot
            },
            data: {
                authorizedRoles: USER_ROLES.agency_all
            }
        })
        .when('/cc/home/:queue/:searchId?', {
            templateUrl: function (params) {

                var templates = {
                    archive: '/partials/cc/archive.html',
                    library: '/partials/cc/library.html'
                };

                return templates[params.queue] || '/partials/cc/index.html';
            },
            controller: 'CopyCoordinatorQueueCtrl',
            resolve: {
                queue: ['$route', function ($route) {
                    return $route.current.params.queue;
                }],
                owners: resolveOwnersForQueue,
                cis: resolveCIsForQueue,
                counts: getCountsForOwners,
                SEARCH_ID: ['$route', function ($route) {
                    return angular.isUndefined($route.current.params.searchId) ? '' : $route.current.params.searchId;
                }]
            },
            data: {
                authorizedRoles: USER_ROLES.media_company_all
            }
        })
        .when('/cc/import_ucr', {
            templateUrl: '/partials/cc/import_ucr.html',
            controller: 'CopyCoordinatorImportUCRCtrl',
            data: {
                authorizedRoles: USER_ROLES.media_company_all
            }
        })
        .when('/cc/possible_revision/:id', {
            templateUrl: '/partials/cc/possible_revision_detected.html',
            controller: 'CopyCoordinatorCIPossibleRevisionDetectedCtrl',
            resolve: {
                ci: resolveCI,
                possible_revisions: resolveCIPossibleRevisions
            },
            data: {
                authorizedRoles: USER_ROLES.media_company_all
            }
        })
        .when('/cc/history/:id', {
            templateUrl: '/partials/cc/history.html',
            controller: 'CopyCoordinatorCIHistoryCtrl',
            resolve: {
                ci: resolveCI,
                history: resolveCIHistory
            },
            data: {
                authorizedRoles: USER_ROLES.media_company_all
            }
        })
        .when('/profile', {
            templateUrl: '/partials/profile/index.html',
            controller: 'ProfileCtrl',
            data: {
                authorizedRoles: USER_ROLES.all
            }
        })
        .otherwise({
            redirectTo: 'login'
        });

    //pollerConfig.resetOnStateChange = true; // If you use $stateProvider from ui-router.
    pollerConfig.resetOnRouteChange = true; // If you use $routeProvider from ngRoute.
    //pollerConfig.delay = 60000; //not sure if this is working!
}

app
    /*
     .config(function(digestHudProvider) {
     digestHudProvider.enable();
     // Optional configuration settings:
     digestHudProvider.numTopWatches = 20;  // number of items to display in detailed table
     digestHudProvider.numDigestStats = 25;  // number of most recent digests to use for min/med/max stats
     })
     */

    .constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    })
    .constant('USER_ROLES', {
        all: '*',
        admin: ['agency.admin', 'media_company.admin'],
        user: ['agency.user', 'media_company.user'],
        agency_admin: 'agency.admin',
        agency_user: 'agency.user',
        agency_all: ['agency.admin', 'agency.user'],
        media_company_admin: 'media_company.admin',
        media_company_user: 'media_company.user',
        media_company_all: ['media_company.admin', 'media_company.user']
    })
/**
 * This is to fix the GMT Timestamp issue on UI. Pivotal Bug# 97012468
 * https://github.com/urish/angular-moment#time-zone-support
 *
 * Issue - Since we convert all dates to 'utc' [see function convertDateStringsToDates()]
 *         angularMoment thinks that the date is 'utc'.
 * Fix: Set angularMoment timezone so it will show correct time.
 */
    .constant('angularMomentConfig', {
        preprocess: 'utc', // unix, utc
        timezone: 'America/New_York'
    })
    .filter('trusted', ['$sce', function ($sce) {
        return function (url) {
            return $sce.trustAsResourceUrl(url);
        };
    }])
    .filter('capitalize', function () {

        return function (input, scope) {

            if (input != null) {
                input = input.toLowerCase();
            }

            return input.substring(0, 1).toUpperCase() + input.substring(1);
        }
    })
    .config([
        '$compileProvider',
        '$routeProvider',
        '$locationProvider',
        '$httpProvider',
        '$sceDelegateProvider',
        'RestangularProvider',
        'pollerConfig',
        'USER_ROLES',
        config])
    .run([
        '$rootScope',
        '$location',
        'AUTH_EVENTS',
        'AuthService',
        'NotifierService',
        'Restangular',
        'mvIdentity',
        'DataService',
        'FilterService',
        '$timeout',
        function ($rootScope,
                  $location,
                  AUTH_EVENTS,
                  AuthService,
                  NotifierService,
                  Restangular,
                  mvIdentity,
                  DataService,
                  FilterService,
                  $timeout) {

            $rootScope.$on("$routeChangeStart", function (event, next, current) {

                if (!next.data || !next.data.authorizedRoles) {
                    console.log('Current route does not have authorizedRoles.');
                    return;
                }

                var authorizedRoles = next.data.authorizedRoles;

                if (!AuthService.isAuthorized(authorizedRoles)) {

                    event.preventDefault();

                    if (AuthService.isAuthenticated()) {
                        // user is not allowed
                        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                    } else {
                        // user is not logged in
                        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                    }
                }
            });

            $rootScope.$on('$routeChangeError', function (evt, current, previous, rejection) {
            });

            // William added to extend angular.
            angular.filterWord = function (word) {
                return word.split(/\s+/).map(function (w) {
                    return w[0].toUpperCase() + w.substr(1).toLowerCase();
                }).join(' ');
            };

            var interceptor = function (response) {

                var handlers = {
                    //Unauthorized or failed to authorize
                    401: function () {
                        //in case of failure on login page do not redirect to login again
                        $timeout(function () {
                            $rootScope.$apply(function () {
                                NotifierService.notifyError('User is not authorized', 4000);
                                $location.path('/login');
                            });
                        }, 0);
                        return false;

                    },
                    //Forbidden
                    403: function () {
                        $timeout(function () {
                            $rootScope.$apply(function () {
                                NotifierService.notifyError('Access denied, forbidden', 5000);
                                $location.path('/login');
                            });
                        }, 0);
                        return false;
                    },
                    // sugar from response.js
                    400: function () {
                        NotifierService.notifyError('bad Request.', 5000);
                        return false;
                    },
                    404: function () {
                        NotifierService.notifyError('Not Found.', 5000);
                        return false;
                    },
                    419: function () {
                        //window.location.href = '/login';
                        // $window not work well: $window.location.assign('/login');
                        $timeout(function () {
                            var modal = jQuery('div.modal-content').find('[data-dismiss="modal"]');
                            if (modal.length && modal.length > 0) {
                                var $modal = modal.get(0);
                                jQuery($modal).trigger('click');
                            }
                        });

                        $timeout(function () {
                            $rootScope.$apply(function () {
                                // for sticky, use string "0" other than Number 0.
                                NotifierService.notifyErrorLast('Your session has expired', '', {
                                    "timeOut": "0", "extendedTimeOut": "0"
                                });
                                $location.path('/login');
                            });
                        }, 0);
                        return false;
                    },
                    440: function () {
                        $timeout(function () {
                            $rootScope.$apply(function () {
                                NotifierService.notifyError('Your session has expired', 4000);
                                $location.path('/login');
                            });
                        }, 0);
                        return false;
                    },
                    //some runtime error like MBean update failure, means partial success
                    503: function () {
                        $timeout(function () {
                            $rootScope.$apply(function () {
                                NotifierService.notifyError('Server-side error', 4000);
                                $location.path('/login');
                            });
                        }, 0);
                        return false;
                    },
                    500: function () {
                        NotifierService.notifyError('Server-side error: Request failed in processing', 4000);
                        if (response.data && response.data.errorType && response.data.errorType === "StaleDataError") {
                            alert(response.data.message);
                            location.reload();
                        }
                        return false;
                    }
                };

                //return (handlers[response.status] || angular.noop).call(null);
                var fn = handlers[response.status];
                if (fn && typeof(fn) === 'function') {
                    fn.call(this);
                    return false;
                }
                return true;
            };

            Restangular.setErrorInterceptor(interceptor);
        }]
);

/*
 .config(function ($httpProvider) {
 $httpProvider.interceptors.push(['$injector',
 function ($injector) {
 return $injector.get('AuthInterceptor');
 }]); })
 .factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
 return {
 responseError: function (response) {
 $rootScope.$broadcast({
 401: AUTH_EVENTS.notAuthenticated,
 403: AUTH_EVENTS.notAuthorized,
 419: AUTH_EVENTS.sessionTimeout,
 440: AUTH_EVENTS.sessionTimeout
 }[response.status], response);
 return $q.reject(response);
 }};})
 */
