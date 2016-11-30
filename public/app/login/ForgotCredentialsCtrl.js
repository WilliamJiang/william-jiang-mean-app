function LoginCtrl($scope,
		   $location,
		   $routeParams,
		   $log,
		   mvIdentity,
		   NotifierService,
		   AuthService) {
	
	$scope.credential = $routeParams.credential;
	if($scope.credential !=="username" && $scope.credential !=="password"){
		$location.path("/");
	}
	
	function resetSubmit(){
    	$scope.errorMessage = undefined;
	}

    $scope.requestForCredentials = function(email, username) {
    	resetSubmit();
        AuthService.requestForCredentials($scope.credential, {email: email, userName: username})
            .then(function(response) {
            	if (response.data.success) {		
            		$scope.credential ="success";	    
                }
                else {
                	$scope.errorMessage = response.data.message;
                }
            });
    };
}

angular
    .module('trafficbridge.login')
    .controller('ForgotCredentialsCtrl',[
	'$scope',
	'$location',
	'$routeParams',
	'$log',
	'mvIdentity',
	'NotifierService',
	'AuthService',
	LoginCtrl
    ]);
