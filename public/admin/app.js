'use strict';

var tbadmin = angular.module('tbadmin', [
    'ngResource',
    'ngAnimate',
    'restangular',
    'ui.bootstrap',
    'ui.router',
    'ui.router.tabs',
    'ui.grid',
    'ui.grid.selection',
    'ui.grid.autoResize',
    'ui.grid.resizeColumns',
    'isteven-multi-select',
    'checklist-model',
    'trafficbridge.admin.login',
    'trafficbridge.admin.signup'
]);

deferredBootstrapper.bootstrap({
    element: document,
    module: 'tbadmin',
    resolve: {
        ADMIN_CONFIG: [
            '$http',
            function ($http) {
                return $http.get('/api/admin/admin_config');
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
                input[key] = new Date(milliseconds);
            }
        }
        else if (typeof value === "object") {
            // Recurse into object
            convertDateStringsToDates(value);
        }
    }
}

tbadmin
    .config(function ($httpProvider, $locationProvider, RestangularProvider) {

        $httpProvider.defaults.transformResponse.push(function (responseData) {
            convertDateStringsToDates(responseData);
            return responseData;
        });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

        RestangularProvider.setBaseUrl('/api');
        RestangularProvider.setRestangularFields({
            id: "_id"
        });

    })
    .run([
        '$rootScope', '$state', '$stateParams',
        function ($rootScope, $state, $stateParams) {

            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            $rootScope.$on("$stateChangeError", console.log.bind(console));
        }]);


//tbadmin.run(function ($rootScope) {
//    $rootScope.$on('$locationChangeSuccess', function () {
//        //console.log('$locationChangeSuccess');
//        $rootScope.$emit('login-display');
//        //$rootScope.$broadcast('login-display');
//    });
//});