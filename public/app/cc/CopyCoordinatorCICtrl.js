function CopyCoordinatorCICtrl($scope,
                               $location,
                               $routeParams,
			       $log,
                               DataService,
                               NotifierService,
                               APP_CONFIG) {

    var ci = $scope.ci;
}

angular
    .module('trafficbridge.cc')
    .controller('CopyCoordinatorCICtrl', [
        '$scope',
        '$location',
        '$routeParams',
	'$log',
        'DataService',
        'NotifierService',
        'APP_CONFIG',
        CopyCoordinatorCICtrl
    ]);
