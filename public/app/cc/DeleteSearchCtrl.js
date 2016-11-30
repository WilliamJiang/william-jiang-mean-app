/**
 * Created by PavaniKa on 4/13/2015.
 */

function DeleteSearchCtrl($scope,
                          $modalInstance,
                          $location,
                          $log,
                          DataService,
                          UtilsService,
                          NotifierService,
                          APP_CONFIG,
                          payload) {

    "use strict";
    $scope.payload = payload;

    $scope.ok = function (form) {

        /*var searchName = $scope.data.searchName;
          var searchCriteria = {
          name: searchName,
          query: filtersData
          };*/

        DataService
	    .CI
	    .deleteSearch(payload)
            .then(function (search) {
		
                NotifierService.notifySuccess('Search deleted successfully.');

                //if we loaded this saved search, load the default Library
                var _path = '/cc/home/library' + '/' + payload.searchId;
                if ($location.path() === _path) {
                    $location.path('/cc/home/library');
                }

                $modalInstance.close($scope.payload.searchName);
            }, function (error) {
                $log.debug(error);

                NotifierService.notifyError(error.data.reason);

            });
    };
    
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}

angular.module('trafficbridge.cc').
    controller('DeleteSearchCtrl',[
        '$scope',
        '$modalInstance',
        '$location',
        '$log',
        'DataService',
        'UtilsService',
        'NotifierService',
        'APP_CONFIG',
	'payload',
	DeleteSearchCtrl
    ]);
