function LoginCtrl($scope,
                   $location,
                   $log,
                   mvIdentity,
                   NotifierService,
                   AuthService, $http, $sce) {

    function resetSubmit() {
        $scope.authFailedMessage = undefined;
    }

    function postLoginAlert(data) {
        if (data.message) {
            NotifierService.notifyWarning(data.message);
            //alert(data.message);
        }
    }

    $scope.signin = function (username, password) {
        resetSubmit();
        AuthService.authenticateUser(username, password)
            .then(function (response) {

                //william: to close sticky 'session has expired' box if have.
                var session_expire_box = jQuery('div.toast-error');
                if (session_expire_box.length) {
                    session_expire_box.closest('div#toast-container').remove();
                }

                if (response.data.success) {

                    NotifierService.notifySuccess('Welcome, ' + mvIdentity.currentUser.firstName + ' ' + mvIdentity.currentUser.lastName);

                    var postLoginURL;

                    if (mvIdentity.currentUser.roles.indexOf('agency.user') !== -1) {
                        postLoginURL = '/tc/home/now';
                    } else if (mvIdentity.currentUser.roles.indexOf('media_company.user') !== -1) {
                        postLoginURL = '/cc/home/new';
                    }

                    $location.path(postLoginURL);
                    postLoginAlert(response.data)
                }
                else {
                    $scope.authFailedMessage = response.data.message;
                    //NotifierService.notifyError(response.data.message);
                }
            });
    };

    /**
     * william for about modal popup.
     * information collected:
     * version, latest git-commit, mongodb, today, node_env ...
     */
    $scope.showModal = false;
    $scope.toggleModal = function () {
        $scope.showModal = !$scope.showModal;

        if ($scope.showModal) {
            if (!$scope.about.commit) {

                $http.get('/getVersionInfo').success(function (data) {
                    var info = data.split("\n").map(function (c) {
                        return c;
                    });
                    var commit = '<a href="' + info[0] + '">';
                    commit += info[1] + '</a>';
                    $scope.about.commit = commit;
                    $scope.about.node_env = info[2];
                    $scope.about.db = info[3];
                });
            }
        }
    };

    $scope.writeLabel = function (label) {

        return $sce.trustAsHtml(label);
    }

    $scope.about = $scope.about || {
        today: moment().format('YYYY-MM-DD HH:mm'),
        version: '1.0000',
        subVersion: '1'
    }

}

angular
    .module('trafficbridge.login')
    .controller('LoginCtrl', [
        '$scope',
        '$location',
        '$log',
        'mvIdentity',
        'NotifierService',
        'AuthService', '$http', '$sce',
        LoginCtrl
    ])
    .controller('aboutCtrl', [
        "$scope", "$http", "$sce",
        function ($scope, $http, $sce) {
            angular.noop();
        }
    ]);

/*
 .controller('LoginController', function ($scope, $rootScope, AUTH_EVENTS, AuthService) {
 $scope.credentials = {
 username: '',
 password: ''
 };
 $scope.login = function (credentials) {
 AuthService.login(credentials).then(function (user) {
 $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
 $scope.setCurrentUser(user);
 }, function () {
 $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
 });
 };
 })

 .factory('AuthService', function ($http, Session) {
 var authService = {};

 authService.login = function (credentials) {
 return $http
 .post('/login', credentials)
 .then(function (res) {
 Session.create(res.data.id, res.data.user.id,
 res.data.user.role);
 return res.data.user;
 });
 };

 authService.isAuthenticated = function () {
 return !!Session.userId;
 };

 authService.isAuthorized = function (authorizedRoles) {
 if (!angular.isArray(authorizedRoles)) {
 authorizedRoles = [authorizedRoles];
 }
 return (authService.isAuthenticated() &&
 authorizedRoles.indexOf(Session.userRole) !== -1);
 };

 return authService;
 })

 .service('Session', function () {
 this.create = function (sessionId, userId, userRole) {
 this.id = sessionId;
 this.userId = userId;
 this.userRole = userRole;
 };
 this.destroy = function () {
 this.id = null;
 this.userId = null;
 this.userRole = null;
 };
 return this;
 })

 <div ng-if="currentUser">Welcome, {{ currentUser.name }}</div>
 <div ng-if="isAuthorized(userRoles.admin)">You're admin.</div>
 <div ng-switch on="currentUser.role">
 <div ng-switch-when="userRoles.admin">You're admin.</div>
 <div ng-switch-when="userRoles.editor">You're editor.</div>
 <div ng-switch-default>You're something else.</div>
 </div>

 .config(function ($stateProvider, USER_ROLES) {
 $stateProvider.state('dashboard', {
 url: '/dashboard',
 templateUrl: 'dashboard/index.html',
 data: {
 authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
 }
 });
 })

 .run(function ($rootScope, AUTH_EVENTS, AuthService) {
 $rootScope.$on('$stateChangeStart', function (event, next) {
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
 })

 .directive('loginDialog', function (AUTH_EVENTS) {
 return {
 restrict: 'A',
 template: '<div ng-if="visible"
 ng-include="\'login-form.html\'">',
 link: function (scope) {
 var showDialog = function () {
 scope.visible = true;
 };

 scope.visible = false;
 scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
 scope.$on(AUTH_EVENTS.sessionTimeout, showDialog)
 }
 };
 })

 <div login-dialog ng-if="!isLoginPage"></div>
 */
