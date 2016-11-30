/**
 * Created by PavaniKa on 3/19/2015.
 */
function CIRevisionsCtrl($scope) {
    
    $scope.$on('$includeContentLoaded', function (event, url, c, d) {
        //this is to prevent propagation of this event into parent scope
        event.stopPropagation();
    });
    //TODO:
}

angular.module('trafficbridge.cc').
    controller('CIRevisionsCtrl',[
	'$scope',
	CIRevisionsCtrl
    ]);
	      
