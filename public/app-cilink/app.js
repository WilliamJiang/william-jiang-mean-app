// Authorization and authentication code adapted from:
//https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec

var app = angular.module('app', [
    'ngResource',
    'ngRoute',
    'restangular'
]), baseApiUrl = "http://trafficbridge-dev.elasticbeanstalk.com/api";

function config($routeProvider,
                $locationProvider,
                RestangularProvider,
				USER_ROLES) {


    RestangularProvider.setBaseUrl(baseApiUrl);

    // In this case we are mapping the id of each element to the _id field.
    // We also change the Restangular route.
    // The default value for parentResource remains the same.
    RestangularProvider.setRestangularFields({
        id: "_id"
        //route: "restangularRoute",
        //selfLink: "self.href"
    });

    
    ////////////////////////////////////////////////////////////////////////////////    

    $routeProvider
/*	    .when('/', {
            template: '<p>{{google}}</p>',
            controller: function($scope){$scope.google = "Google";}
        })*/
        .when('/cc/view/:id', {
            templateUrl: 'cc/view.html',
            controller: 'CopyCoordinatorCIViewCtrl'
        })
        .otherwise({
            redirectTo: '/cc/view/54eb5633cec37b931946fabcd1za'
        });

}

app

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
    .constant('APP_CONFIG', {
    })
    .config(['$routeProvider',
        '$locationProvider',
        'RestangularProvider',
        'USER_ROLES',
        config]);

