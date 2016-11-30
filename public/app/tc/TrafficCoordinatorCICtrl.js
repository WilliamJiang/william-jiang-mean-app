function TrafficCoordinatorCICtrl($scope,
                                  $location,
                                  $routeParams,
				  $log,
                                  DataService,
                                  NotifierService,
                                  APP_CONFIG) {

    var ci = $scope.ci;
}

angular
    .module('trafficbridge.tc')
    .controller('TrafficCoordinatorCICtrl', [
        '$scope',
        '$location',
        '$routeParams',
	'$log',
        'DataService',
        'NotifierService',
        'APP_CONFIG',
        TrafficCoordinatorCICtrl
    ]);
