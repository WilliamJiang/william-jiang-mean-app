function ApplicationCtrl($scope,
			 $location,
			 AuthService,
			 NotifierService,
			 AUTH_EVENTS,
			 USER_ROLES,
			 mvIdentity) {

    $scope.timezone = jstz.determine();

    $scope.mvIdentity = mvIdentity;

    $scope.USER_ROLES = USER_ROLES;

    function onNotAuthenticated() {
	$location.path('/login');
    }

    function onNotAuthorized() {
        NotifierService.notifyError('Not authorized.');
    }    

    function onSessionTimeout() {
	$location.path('/login');
    }    

    $scope.$on(AUTH_EVENTS.notAuthenticated,onNotAuthenticated);
    $scope.$on(AUTH_EVENTS.notAuthorized,onNotAuthorized);    
    $scope.$on(AUTH_EVENTS.sessionTimeout,onSessionTimeout)
}

angular
    .module('trafficbridge.common')
    .controller('ApplicationCtrl',[
	'$scope',
	'$location',
	'AuthService',
	'NotifierService',
	'AUTH_EVENTS',
	'USER_ROLES',
	'mvIdentity',
	ApplicationCtrl
    ]);
