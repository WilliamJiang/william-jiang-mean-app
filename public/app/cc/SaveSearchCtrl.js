/**
 * Created by PavaniKa on 3/25/2015.
 */

function SaveSearchCtrl($scope,
                        $modalInstance,
                        $log,
                        DataService,
                        UtilsService,
                        NotifierService,
                        APP_CONFIG,
                        filtersData) {

    $scope.data = {};

    $scope.ok = function (form) {

        var searchName = $scope.data.searchName;
        var searchCriteria = {
            name: searchName,
            query: filtersData
        };

        DataService
            .CI
            .saveSearch(searchCriteria)
            .then(function (saveSearch) {
                NotifierService.notifySuccess('Search saved successfully.');

                //TESTING
                DataService.CI.getSavedSearches()
                    .then(function (searches) {
                        //$log.debug('Saved Searches length: ' + searches.length);
                        if (searches.length > 0) {
                            var search_id = searches[1].search_id;
                            DataService.CI.getSavedSearchById(search_id)
                                .then(function (search) {
                                    $log.debug('Search Criteria: ', search);
                                }, function (err) {
                                    $log.debug('Error while getting saved search criteria: ', err);
                                });
                        }
                        $modalInstance.close($scope.data.searchName);
                    }, function (err) {
                        console.dir(err);
                    });

                $modalInstance.close($scope.data.searchName);

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
    controller('SaveSearchCtrl',[
        '$scope',
        '$modalInstance',
        '$log',
        'DataService',
        'UtilsService',
        'NotifierService',
        'APP_CONFIG',
        'filtersData',
        SaveSearchCtrl
    ]);
